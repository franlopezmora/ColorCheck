"use client";
import { useState, useEffect, useCallback } from "react";
import ColorPalette from "./components/ColorPalette";
import ExportPanel from "./components/ExportPanel";
import AnalysisPanel from "./components/AnalysisPanel";
import ThemeToggle from "./components/ThemeToggle";
import Tooltip from "./components/Tooltip";
import PaletteGenerator from "./components/PaletteGenerator";
import CommandPalette from "./components/CommandPalette";
import PaletteManager from "./components/PaletteManager";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import ToastContainer from "./components/ToastContainer";

type Threshold = "aa_normal" | "aa_large" | "aaa_normal" | "aaa_large" | "ui_graphic";

const thresholdLabels: Record<Threshold, string> = {
  aa_normal: "AA Normal (4.5:1)",
  aa_large: "AA Large (3:1)",
  aaa_normal: "AAA Normal (7:1)",
  aaa_large: "AAA Large (4.5:1)",
  ui_graphic: "UI Graphic (3:1)"
};

export default function Page() {
  const [colors, setColors] = useState<string[]>(["#0EA5E9", "#111827", "#F9FAFB", "#F97316"]);
  const [pairs, setPairs] = useState<Array<{fg: string; bg: string; ratio: number; passes: string[]}>>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<Threshold>("aa_normal");
  const [error, setError] = useState<string>("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAPIInfo, setShowAPIInfo] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPaletteManager, setShowPaletteManager] = useState(false);
  
  // Hook para Command Palette
  const { isOpen: isCommandPaletteOpen, closeCommandPalette } = useCommandPalette();

  // Bloquear scroll cuando cualquier modal esté abierto
  useEffect(() => {
    const hasOpenModal = showAPIInfo || showDocs || showAnalysis || showExport || showPaletteManager || isCommandPaletteOpen;
    document.body.style.overflow = hasOpenModal ? 'hidden' : 'unset';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAPIInfo, showDocs, showAnalysis, showExport, showPaletteManager, isCommandPaletteOpen]);

  // Manejar tecla Escape para cerrar modales
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAPIInfo) {
          setShowAPIInfo(false);
        } else if (showDocs) {
          setShowDocs(false);
        }
      }
    };

    if (showAPIInfo || showDocs) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAPIInfo, showDocs]);



  // Análisis automático cuando cambian los colores
  useEffect(() => {
    const analyzeColors = async () => {
      const palette = colors.filter(Boolean);
      
      if (palette.length < 2) {
        setPairs([]);
        setError("");
        return;
      }

      // Validar colores
      const invalidColors = palette.filter(color => {
        const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        return !hexPattern.test(color.trim());
      });

      if (invalidColors.length > 0) {
        setError(`Colores inválidos: ${invalidColors.join(", ")}`);
        setPairs([]);
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        const res = await fetch("/api/pairs", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ palette, threshold })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.error || `Error del servidor (${res.status})`);
          setPairs([]);
          return;
        }
        
        const json = await res.json();
        
        if (!json.ok) {
          setError(json.error || "Error al analizar los colores");
          setPairs([]);
        } else {
          setPairs(json.pairs ?? []);
          if (json.pairs && json.pairs.length === 0) {
            setError("No hay combinaciones accesibles");
          }
        }
      } catch (e) {
        console.error("Error en análisis:", e);
        setError("Error de conexión");
        setPairs([]);
      }
      
      setLoading(false);
    };

    const timeoutId = setTimeout(analyzeColors, 500);
    return () => clearTimeout(timeoutId);
  }, [colors, threshold]);

  const handlePaletteGenerated = (newColors: string[]) => {
    setColors(newColors);
  };

  const handleLoadPalette = (newColors: string[]) => {
    setColors(newColors);
  };

  const copyToClipboard = (text: string, message?: string) => {
    navigator.clipboard.writeText(text);
    if (message) {
      showSuccess(message);
    }
  };

  // Funciones para Command Palette
  const handleCommandAnalyze = useCallback(() => {
    setShowAnalysis(true);
  }, []);

  const handleCommandGenerate = useCallback(() => {
    // Scroll hacia el generador de paletas
    const generatorElement = document.querySelector('[data-generator]');
    if (generatorElement) {
      generatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCommandExport = () => {
    setShowExport(true);
  };


  const { toggleTheme } = useTheme();
  const { toasts, showSuccess, removeToast } = useToast();
  
  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Manejar comandos rápidos del Command Palette
  useEffect(() => {
    const handleQuickCommand = (event: CustomEvent) => {
      const command = event.detail.command;
      
      switch (command) {
        case 'add-color':
          // Simular click en el botón de agregar color
          const addColorBtn = document.querySelector('[data-add-color]');
          if (addColorBtn) {
            (addColorBtn as HTMLElement).click();
          }
          break;
        case 'generate-palette':
          // Limpiar paleta y abrir generador
          const clearBtn = document.querySelector('button[data-clear-palette]') ||
                           document.querySelector('button[aria-label*="limpiar"]') ||
                           document.querySelector('button[aria-label*="Limpiar"]');
          if (clearBtn) {
            (clearBtn as HTMLElement).click();
            setTimeout(() => {
              handleCommandGenerate();
            }, 100);
          }
          break;
        case 'export':
          setShowExport(true);
          break;
        case 'toggle-theme':
          handleToggleTheme();
          break;
        case 'change-wcag':
          // Scroll hacia el selector WCAG
          const wcagElement = document.querySelector('[data-wcag-selector]');
          if (wcagElement) {
            wcagElement.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const firstButton = wcagElement.querySelector('button');
              if (firstButton) {
                (firstButton as HTMLElement).focus();
              }
            }, 300);
          }
          break;
        case 'open-docs':
          setShowDocs(true);
          break;
        case 'save-palette':
        case 'load-palette':
          setShowPaletteManager(true);
          break;
        case 'analyze-current':
          handleCommandAnalyze();
          break;
      }
    };

    document.addEventListener('quickCommand', handleQuickCommand as EventListener);
    return () => {
      document.removeEventListener('quickCommand', handleQuickCommand as EventListener);
    };
  }, [handleToggleTheme, handleCommandAnalyze, handleCommandGenerate]);


  const getPassBadgeColor = (passes: string[]) => {
    if (passes.includes("aaa_normal")) return "bg-[var(--success)]/20 text-[var(--success)]";
    if (passes.includes("aa_normal")) return "bg-[var(--primary)]/20 text-[var(--primary)]";
    if (passes.includes("aa_large")) return "bg-[var(--warning)]/20 text-[var(--warning)]";
    return "bg-[var(--muted)] text-[var(--muted-foreground)]";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 171 177" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M85.5 55C100.688 55 113 42.6878 113 27.5C113 12.3122 100.688 0 85.5 0C70.3122 0 58 12.3122 58 27.5C58 42.6878 70.3122 55 85.5 55Z" fill="#FF6B6B"/>
                  <path d="M143.5 82C158.688 82 171 69.6878 171 54.5C171 39.3122 158.688 27 143.5 27C128.312 27 116 39.3122 116 54.5C116 69.6878 128.312 82 143.5 82Z" fill="#FFD166"/>
                  <path d="M143.5 149C158.688 149 171 136.688 171 121.5C171 106.312 158.688 94 143.5 94C128.312 94 116 106.312 116 121.5C116 136.688 128.312 149 143.5 149Z" fill="#06D6A0"/>
                  <path d="M85.5 177C100.688 177 113 164.688 113 149.5C113 134.312 100.688 122 85.5 122C70.3122 122 58 134.312 58 149.5C58 164.688 70.3122 177 85.5 177Z" fill="#118AB2"/>
                  <path d="M27.5 149C42.6878 149 55 136.688 55 121.5C55 106.312 42.6878 94 27.5 94C12.3122 94 0 106.312 0 121.5C0 136.688 12.3122 149 27.5 149Z" fill="#9B5DE5"/>
                  <path d="M27.5 82C42.6878 82 55 69.6878 55 54.5C55 39.3122 42.6878 27 27.5 27C12.3122 27 0 39.3122 0 54.5C0 69.6878 12.3122 82 27.5 82Z" fill="#FF8FAB"/>
                  <path d="M85.5 110C97.3741 110 107 100.374 107 88.5C107 76.6259 97.3741 67 85.5 67C73.6259 67 64 76.6259 64 88.5C64 100.374 73.6259 110 85.5 110Z" fill="#111827"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">ColorCheck</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAPIInfo(!showAPIInfo)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]/100"
              >
                API
              </button>
              <button 
                onClick={() => setShowDocs(!showDocs)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]/100"
                data-docs-button
              >
                Docs
              </button>
              <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/20 px-2 py-1 rounded">
                <span>Ctrl+K</span>
                <span className="text-[var(--muted-foreground)]/60">Comandos</span>
              </div>
              <a 
                href="https://github.com/franlopezmora/colorcheck"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]/100"
                aria-label="Ver en GitHub"
                title="Ver en GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <div className="w-px h-4 bg-[var(--border)]"></div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* API Info Modal */}
      {showAPIInfo && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAPIInfo(false)}
        >
          <div 
            className="bg-[var(--card)] rounded-lg border border-[var(--border)] max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  API Endpoints
                </h2>
                <button
                  onClick={() => setShowAPIInfo(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header Info */}
                <div className="text-center border-b border-[var(--border)] pb-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">ColorCheck API</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Analiza la accesibilidad de paletas de colores según estándares WCAG
                  </p>
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded">v1.1</span>
                  </div>
                </div>

                {/* Base URL */}
                <div className="bg-[var(--muted)]/20 rounded-lg p-4">
                  <h4 className="font-medium text-[var(--foreground)] mb-2">Base URL</h4>
                  <code className="text-sm bg-[var(--background)] px-3 py-2 rounded border font-mono">
                    {window.location.origin}/api
                  </code>
                </div>

                {/* Endpoints */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[var(--foreground)]">Endpoints Disponibles</h4>
                  
                  {/* POST /api/pairs */}
                  <div className="bg-[var(--muted)]/10 rounded-lg p-4 border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-mono">POST</span>
                      <code className="font-mono text-sm">/api/pairs</code>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      Analiza una paleta de colores y devuelve combinaciones accesibles según estándares WCAG
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">Parámetros</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex gap-2">
                            <span className="font-mono bg-[var(--background)] px-2 py-1 rounded">palette</span>
                            <span className="text-[var(--muted-foreground)]">Array de colores en formato HEX</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono bg-[var(--background)] px-2 py-1 rounded">threshold</span>
                            <span className="text-[var(--muted-foreground)]">Estándar WCAG: &quot;aa_normal&quot;, &quot;aa_large&quot;, &quot;aaa_normal&quot;</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono bg-[var(--background)] px-2 py-1 rounded">limit</span>
                            <span className="text-[var(--muted-foreground)]">Número máximo de combinaciones (opcional, default: 50)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">Ejemplo de Request</h5>
                        <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "palette": ["#0EA5E9", "#111827", "#F59E0B"],
  "threshold": "aa_normal",
  "limit": 20
}`}
                        </pre>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">Ejemplo de Response</h5>
                        <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "ok": true,
  "pairs": [
    {
      "foreground": "#111827",
      "background": "#0EA5E9",
      "contrast": 4.8,
      "level": "AA"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* GET /api/tokens */}
                  <div className="bg-[var(--muted)]/10 rounded-lg p-4 border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-mono">GET</span>
                      <code className="font-mono text-sm">/api/tokens</code>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      Obtiene información sobre tokens de color y variables CSS
                    </p>
                    
                    <div>
                      <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">Ejemplo de Response</h5>
                      <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "ok": true,
  "tokens": {
    "primary": "#0EA5E9",
    "secondary": "#111827",
    "accent": "#F59E0B"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-4">
                  <h4 className="font-medium text-[var(--warning)] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Disclaimer
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Esta API es gratuita para proyectos personales. Para uso comercial o alto volumen de peticiones, 
                    contacta con el desarrollador:
                  </p>
                  <div className="mt-2 space-y-2">
                    <div>
                      <a 
                        href="mailto:franciscolopezmora3@gmail.com?subject=Consulta sobre ColorCheck API&body=Hola Francisco,%0D%0A%0D%0AMe interesa usar la API de ColorCheck para:%0D%0A%0D%0A- Proyecto comercial%0D%0A- Alto volumen de peticiones%0D%0A- Otra consulta:%0D%0A%0D%0ADetalles:%0D%0A%0D%0A"
                        className="text-sm bg-[var(--background)] px-3 py-2 rounded border font-mono hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-colors cursor-pointer inline-block"
                      >
                        franciscolopezmora3@gmail.com
                      </a>
                    </div>
                    <div>
                      <a 
                        href="https://github.com/franlopezmora/colorcheck"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-[var(--background)] px-3 py-2 rounded border font-mono hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-colors cursor-pointer inline-block"
                      >
                        github.com/franlopezmora/colorcheck
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {showDocs && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDocs(false)}
        >
          <div 
            className="bg-[var(--card)] rounded-lg border border-[var(--border)] max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Documentación
                </h2>
                <button
                  onClick={() => setShowDocs(false)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* ¿Qué es ColorCheck? */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">¿Qué es ColorCheck?</h3>
                  <p className="text-[var(--muted-foreground)] mb-3">
                    ColorCheck es un analizador de accesibilidad de paletas de colores diseñado para combinar facilidad de uso, análisis automático y cumplimiento de estándares WCAG.
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    La herramienta analiza automáticamente las combinaciones de colores de tu paleta y te muestra cuáles cumplen con los niveles de accesibilidad requeridos para diferentes tipos de contenido web.
                  </p>
                </div>

                {/* Accesibilidad */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Accesibilidad</h3>
                  <p className="text-[var(--muted-foreground)] mb-3">
                    La accesibilidad web es fundamental para crear experiencias inclusivas. Muchos usuarios tienen diferentes tipos de discapacidad visual, 
                    incluyendo daltonismo, baja visión y otros problemas de percepción del color.
                  </p>
                  <p className="text-[var(--muted-foreground)] mb-3">
                    Las pautas WCAG (Web Content Accessibility Guidelines) establecen estándares internacionales para hacer el contenido web más accesible. 
                    Estas directrices ayudan a diseñadores y desarrolladores a crear sitios web que funcionen para todos los usuarios.
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    ColorCheck te ayuda a crear paletas de colores accesibles analizando automáticamente el contraste entre colores 
                    y verificando que cumplan con los estándares WCAG 2.1 para diferentes tipos de contenido.
                  </p>
                </div>

                {/* Estándares WCAG */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Estándares WCAG</h3>
                  <p className="text-[var(--muted-foreground)] mb-3">
                    Los requisitos de accesibilidad varían de nivel de exigencia, siendo el más exigente el nivel AAA, 
                    seguido del AA y finalmente el menos exigente, el A.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 rounded-lg">
                      <span className="w-4 h-4 bg-[var(--primary)] rounded-full"></span>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">AA Normal</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Contraste mínimo 4.5:1 para textos de párrafo (~18px)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 rounded-lg">
                      <span className="w-4 h-4 bg-[var(--warning)] rounded-full"></span>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">AA Large</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Contraste mínimo 3:1 para textos grandes (~24px)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 rounded-lg">
                      <span className="w-4 h-4 bg-[var(--success)] rounded-full"></span>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">AAA Normal</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Contraste mínimo 7:1 para máxima accesibilidad</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cómo usar */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Cómo usar ColorCheck</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Agrega colores a tu paleta</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Usa el selector de color o ingresa códigos HEX directamente</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Selecciona el estándar</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Elige entre AA Normal, AA Large o AAA Normal según tus necesidades</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Revisa los resultados</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Ve las combinaciones accesibles y sus niveles de contraste</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generador de Paleta */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Generador de Paleta</h3>
                  <p className="text-[var(--muted-foreground)] mb-3">
                    Usa el generador de paleta para crear esquemas de color armónicos basados en un color base. 
                    Puedes elegir entre diferentes tipos de armonía: complementario, análogo, triádico, tetrádico o monocromático.
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    Una vez generada la paleta, ColorCheck la analizará automáticamente para encontrar las combinaciones accesibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Analizador de Accesibilidad de Colores
          </h2>
          
          {/* Main Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              {/* Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4" data-wcag-selector>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                    Estándar WCAG
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(thresholdLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setThreshold(key as Threshold)}
                        className={`w-full p-2 rounded-lg border transition-all text-left text-xs ${
                          threshold === key
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "border-[var(--border)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Estadísticas
                    </h3>
                    {loading && (
                      <div className="flex items-center gap-1 text-xs text-[var(--primary)]">
                        <div className="w-3 h-3 border border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        Analizando...
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Colores</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{colors.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Combinaciones</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {loading ? '...' : pairs.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Estándar</span>
                      <span className="text-sm font-medium text-[var(--primary)]">{threshold.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Palette Manager Button */}
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
                  <button
                    onClick={() => setShowPaletteManager(true)}
                    className="w-full px-3 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/80 transition-colors text-sm font-medium flex items-center justify-center gap-2 border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Gestionar Paletas</span>
                  </button>
                  <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
                    Guarda y carga tus paletas favoritas
                  </p>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div 
                    className="p-4 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)] text-[var(--destructive)]"
                    role="alert"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-9 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Paleta de Colores */}
                  <div className="lg:col-span-2">
                    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
                      <ColorPalette colors={colors} onChange={setColors} onShowToast={showSuccess} />
                    </div>
                    
                    {/* Empty State */}
                    {colors.length < 2 && (
                      <div className="mt-4 text-center py-8">
                        <div className="mb-3">
                          <svg className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                          Agrega colores a tu paleta
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Agrega al menos 2 colores para comenzar el análisis.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Generador de Paleta */}
                  <div className="lg:col-span-1" data-generator>
                    <PaletteGenerator onPaletteGenerated={handlePaletteGenerated} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 space-y-6 animate-fade-in">


          {/* Results Section */}
          {pairs.length > 0 && (
            <section className="mt-12 space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Combinaciones Accesibles
                  </h2>
                  <p className="text-[var(--muted-foreground)] mt-1">
                    {pairs.length} combinaciones encontradas con estándar {threshold.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    pairs.map(p => `${p.fg} on ${p.bg} - Ratio: ${p.ratio} - ${p.passes.join(", ")}`).join('\n'),
                    'Lista de combinaciones copiada al portapapeles'
                  )}
                  className="px-4 py-2 rounded-lg bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/50 transition-colors flex items-center border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar Lista
                </button>
              </div>

              {/* Action Buttons */}
              {colors.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAnalysis(true)}
                    className="px-4 py-2 bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/50 transition-colors text-sm font-medium flex items-center border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Análisis de Paleta
                  </button>
                  <button
                    onClick={() => setShowExport(true)}
                    className="px-4 py-2 bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/50 transition-colors text-sm font-medium flex items-center border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Resultados
                  </button>
                  <button
                    onClick={() => setShowPaletteManager(true)}
                    className="px-4 py-2 bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/50 transition-colors text-sm font-medium flex items-center border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Guardar Paleta
                  </button>
                </div>
              )}

              {/* Color Combinations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pairs.map((p, i) => (
                  <article 
                    key={i} 
                    className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--muted-foreground)] transition-all flex flex-col h-full"
                  >
                    <div 
                      className="p-6" 
                      style={{ color: p.fg, background: p.bg }}
                    >
                      <div className="text-2xl font-bold mb-1">Aa</div>
                      <div className="text-xs opacity-90 font-mono">
                        {p.fg} on {p.bg}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[var(--muted-foreground)]">Contraste</span>
                        <span className="text-lg font-bold text-[var(--foreground)]">
                          {p.ratio}:1
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <span className="text-sm text-[var(--muted-foreground)] block">Estándares</span>
                        <div className="flex flex-wrap gap-1">
                          {p.passes.map((pass: string) => (
                            <span
                              key={pass}
                              className={`px-2 py-1 rounded text-xs font-medium ${getPassBadgeColor(p.passes)}`}
                            >
                              {thresholdLabels[pass as Threshold] || pass}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <button
                          onClick={() => copyToClipboard(`color: ${p.fg}; background-color: ${p.bg};`, 'CSS de combinación copiado al portapapeles')}
                          className="w-full py-3 px-4 rounded-lg bg-[var(--primary)]/90 text-[var(--primary-foreground)] text-sm font-medium transition-colors hover:bg-[var(--primary)]/70 border-2 border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
                        >
                          Copiar CSS
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Modals */}
          <AnalysisPanel 
            colors={colors} 
            pairs={pairs} 
            threshold={threshold} 
            isOpen={showAnalysis}
            onClose={() => setShowAnalysis(false)}
          />
          
          <ExportPanel
            pairs={pairs}
            colors={colors}
            threshold={threshold}
            isOpen={showExport}
            onClose={() => setShowExport(false)}
            onShowToast={showSuccess}
          />

          {/* Command Palette */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={closeCommandPalette}
            onAnalyze={handleCommandAnalyze}
            onGenerate={handleCommandGenerate}
            onExport={handleCommandExport}
            onToggleTheme={handleToggleTheme}
            onOpenPaletteManager={() => setShowPaletteManager(true)}
            onShowToast={showSuccess}
            colors={colors}
            pairs={pairs}
          />

          {/* Palette Manager */}
          <PaletteManager
            currentColors={colors}
            onLoadPalette={handleLoadPalette}
            isOpen={showPaletteManager}
            onClose={() => setShowPaletteManager(false)}
          />
        </div>
      </main>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import ColorPalette from "./components/ColorPalette";
import ExportPanel from "./components/ExportPanel";
import AnalysisPanel from "./components/AnalysisPanel";
import ThemeToggle from "./components/ThemeToggle";

type Threshold = "aa_normal" | "aa_large" | "aaa_normal" | "aaa_large" | "ui_graphic";

const thresholdLabels: Record<Threshold, string> = {
  aa_normal: "AA Normal (4.5:1)",
  aa_large: "AA Large (3:1)",
  aaa_normal: "AAA Normal (7:1)",
  aaa_large: "AAA Large (4.5:1)",
  ui_graphic: "UI Graphic (3:1)"
};

export default function Page() {
  const [colors, setColors] = useState(["#0EA5E9", "#111827", "#F9FAFB", "#F97316"]);
  const [pairs, setPairs] = useState<Array<{fg: string; bg: string; ratio: number; passes: string[]}>>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<Threshold>("aa_normal");
  const [error, setError] = useState<string>("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAPIInfo, setShowAPIInfo] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Bloquear scroll cuando cualquier modal esté abierto
  useEffect(() => {
    if (showAPIInfo || showDocs || showAnalysis || showExport) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAPIInfo, showDocs, showAnalysis, showExport]);

  async function onAnalyze() {
    setLoading(true);
    setError("");
    
    try {
      const palette = colors.filter(Boolean);
      
      if (palette.length < 2) {
        setError("Necesitas al menos 2 colores para analizar");
        setLoading(false);
        return;
      }

      // Validate colors before sending
      const invalidColors = palette.filter(color => {
        const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        return !hexPattern.test(color.trim());
      });

      if (invalidColors.length > 0) {
        setError(`Colores inválidos detectados: ${invalidColors.join(", ")}`);
        setLoading(false);
        return;
      }

    const res = await fetch("/api/pairs", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ palette, threshold })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || `Error del servidor (${res.status})`);
        setLoading(false);
        return;
      }
      
    const json = await res.json();
      
      if (!json.ok) {
        setError(json.error || "Error al analizar los colores");
      } else {
    setPairs(json.pairs ?? []);
        if (json.pairs && json.pairs.length === 0) {
          setError("No se encontraron combinaciones accesibles con el estándar seleccionado");
        }
      }
    } catch (e) {
      console.error("Error en análisis:", e);
      setError("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.");
    }
    
    setLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }


  const optimizeForAccessibility = () => {
    // Generar colores con mejor contraste
    const optimizedColors = [
      '#1a1a1a', // Negro más suave
      '#ffffff', // Blanco puro
      '#2563eb', // Azul accesible
      '#dc2626', // Rojo accesible
      '#059669'  // Verde accesible
    ];
    setColors(optimizedColors);
  };

  const addComplementaryColors = () => {
    // Agregar colores complementarios a la paleta actual
    const complementaryColors = [
      '#8b5cf6', // Púrpura
      '#06b6d4', // Cian
      '#f59e0b', // Naranja
      '#ef4444', // Rojo vibrante
      '#10b981'  // Verde esmeralda
    ];
    setColors(prev => [...prev, ...complementaryColors]);
  };

  const applyThemeOptimization = () => {
    // Optimizar para modo oscuro
    const darkThemeColors = [
      '#0f172a', // Slate 900
      '#1e293b', // Slate 800
      '#334155', // Slate 700
      '#64748b', // Slate 500
      '#94a3b8'  // Slate 400
    ];
    setColors(darkThemeColors);
  };

  const applyTrendColors = () => {
    // Colores de tendencia 2024
    const trendColors = [
      '#f8fafc', // Blanco cálido
      '#1e293b', // Azul marino
      '#f59e0b', // Dorado
      '#ec4899', // Rosa vibrante
      '#06b6d4'  // Turquesa
    ];
    setColors(trendColors);
  };

  function getPassBadgeColor(passes: string[]) {
    if (passes.includes("aaa_normal")) return "bg-[var(--success)]/20 text-[var(--success)]";
    if (passes.includes("aa_normal")) return "bg-[var(--primary)]/20 text-[var(--primary)]";
    if (passes.includes("aa_large")) return "bg-[var(--warning)]/20 text-[var(--warning)]";
    return "bg-[var(--muted)] text-[var(--muted-foreground)]";
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">ColorCheck</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAPIInfo(!showAPIInfo)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                API
              </button>
              <button 
                onClick={() => setShowDocs(!showDocs)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Docs
              </button>
              <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-label="GitHub"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
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
                <h2 className="text-xl font-semibold text-[var(--foreground)]">🔌 API Endpoints</h2>
                <button
                  onClick={() => setShowAPIInfo(false)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[var(--muted)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">POST /api/analyze</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-2">Analiza una paleta de colores</p>
                  <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "palette": ["#0EA5E9", "#111827", "#F9FAFB"],
  "options": { "threshold": "aa_normal" }
}`}
                  </pre>
                </div>

                <div className="bg-[var(--muted)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">POST /api/pairs</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-2">Obtiene combinaciones accesibles</p>
                  <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "palette": ["#0EA5E9", "#111827"],
  "threshold": "aa_normal",
  "limit": 50
}`}
                  </pre>
                </div>

                <div className="bg-[var(--muted)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">POST /api/tokens</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-2">Genera tokens de diseño</p>
                  <pre className="text-xs bg-[var(--background)] p-3 rounded border overflow-x-auto">
{`{
  "palette": {
    "primary": "#0EA5E9",
    "secondary": "#111827"
  }
}`}
                  </pre>
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
                <h2 className="text-xl font-semibold text-[var(--foreground)]">📚 Documentación</h2>
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
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">¿Qué es ColorCheck?</h3>
                  <p className="text-[var(--muted-foreground)]">
                    ColorCheck es una herramienta para analizar la accesibilidad de paletas de colores según los estándares WCAG (Web Content Accessibility Guidelines).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Estándares WCAG</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[var(--primary)] rounded-full"></span>
                      <span className="text-sm"><strong>AA Normal:</strong> Contraste mínimo 4.5:1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[var(--warning)] rounded-full"></span>
                      <span className="text-sm"><strong>AA Large:</strong> Contraste mínimo 3:1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[var(--success)] rounded-full"></span>
                      <span className="text-sm"><strong>AAA Normal:</strong> Contraste mínimo 7:1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[var(--success)] rounded-full"></span>
                      <span className="text-sm"><strong>AAA Large:</strong> Contraste mínimo 4.5:1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[var(--muted-foreground)] rounded-full"></span>
                      <span className="text-sm"><strong>UI Graphic:</strong> Contraste mínimo 3:1</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Cómo usar</h3>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--muted-foreground)]">
                    <li>Agrega colores a tu paleta (mínimo 2)</li>
                    <li>Selecciona el estándar WCAG deseado</li>
                    <li>Haz clic en &quot;Analizar Accesibilidad&quot;</li>
                    <li>Revisa las combinaciones accesibles encontradas</li>
                    <li>Exporta los resultados en el formato que necesites</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Formatos de Exportación</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[var(--muted-foreground)]">
                    <div>🎨 CSS Variables</div>
                    <div>💎 SCSS Variables</div>
                    <div>⚡ Tailwind CSS</div>
                    <div>📄 JSON</div>
                    <div>🎯 Figma Markdown</div>
                    <div>🔧 Figma JSON</div>
                  </div>
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
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8">
            Verifica que tus paletas de colores cumplan con los estándares WCAG AA y AAA. 
            Encuentra combinaciones accesibles y exporta para Figma.
          </p>
          
          {/* Quick Access - Estándar, Estadísticas, Paleta y Analizar */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Sidebar - Estándar y Estadísticas */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
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
                        role="radio"
                        aria-checked={threshold === key}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                    Estadísticas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Colores</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{colors.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Combinaciones</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{pairs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Estándar</span>
                      <span className="text-sm font-medium text-[var(--primary)]">{threshold.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content - Paleta */}
              <div className="lg:col-span-3">
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
                  <ColorPalette colors={colors} onChange={setColors} />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
        <button
          onClick={onAnalyze}
                disabled={loading || colors.filter(Boolean).length < 2}
                className="px-8 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
                {loading ? 'Analizando...' : 'Analizar Accesibilidad'}
        </button>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
            
            {/* Empty State Message */}
            {colors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Agrega colores a tu paleta
                </h3>
                <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                  Comienza agregando al menos 2 colores para analizar su accesibilidad y encontrar combinaciones que cumplan con los estándares WCAG.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)] text-[var(--destructive)]"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center space-x-2">
                  <span aria-hidden="true">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

        {/* Results Section */}
        {pairs.length > 0 && (
          <section 
            className="mt-12 space-y-6"
            aria-labelledby="results-title"
            aria-live="polite"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 id="results-title" className="text-2xl font-bold text-[var(--foreground)]">
                  Combinaciones Accesibles
                </h2>
                <p className="text-[var(--muted-foreground)] mt-1">
                  {pairs.length} combinaciones encontradas con estándar {threshold.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(
                  pairs.map(p => `${p.fg} on ${p.bg} - Ratio: ${p.ratio} - ${p.passes.join(", ")}`).join('\n')
                )}
                className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80 transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                aria-label="Copiar lista de combinaciones accesibles"
              >
                📋 Copiar Lista de Combinaciones
              </button>
            </div>

            {/* Action Buttons */}
            {colors.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors text-sm font-medium"
                >
                  📈 Análisis de Paleta
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  className="px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors text-sm font-medium"
                >
                  📤 Exportar Resultados
                </button>
              </div>
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
            />

            {/* Color Combinations Grid */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              role="list"
              aria-label="Combinaciones de colores accesibles"
            >
              {pairs.map((p, i) => (
                <article 
                  key={i} 
                  className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--muted-foreground)] transition-all focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--background)] flex flex-col h-full"
                  role="listitem"
                >
                  <div 
                    className="p-6" 
                    style={{ color: p.fg, background: p.bg }}
                    aria-label={`Vista previa de texto ${p.fg} sobre fondo ${p.bg}`}
                  >
                    <div className="text-2xl font-bold mb-1" aria-hidden="true">Aa</div>
                    <div className="text-xs opacity-90 font-mono">
                      {p.fg} on {p.bg}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[var(--muted-foreground)]">Contraste</span>
                      <span className="text-lg font-bold text-[var(--foreground)]" aria-label={`Ratio de contraste ${p.ratio} a 1`}>
                        {p.ratio}:1
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <span className="text-sm text-[var(--muted-foreground)] block">Estándares</span>
                      <div className="flex flex-wrap gap-1" role="list" aria-label="Estándares WCAG cumplidos">
                        {p.passes.map((pass: string) => (
                          <span
                            key={pass}
                            className={`px-2 py-1 rounded text-xs font-medium ${getPassBadgeColor(p.passes)}`}
                            role="listitem"
                          >
                            {thresholdLabels[pass as Threshold] || pass}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button
                        onClick={() => copyToClipboard(`color: ${p.fg}; background-color: ${p.bg};`)}
                        className="w-full py-3 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] shadow-sm"
                        aria-label={`Copiar CSS para color ${p.fg} sobre fondo ${p.bg}`}
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
        </div>
      </main>
      </div>
  );
}

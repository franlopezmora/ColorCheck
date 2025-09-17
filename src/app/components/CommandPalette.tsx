'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string; // texto visible opcional
  category: 'analysis' | 'generation' | 'export' | 'navigation' | 'settings' | 'storage';
  keys?: string[];   // atajo tipo ['g', 'e'] o ['t']
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onToggleTheme: () => void;
  onOpenPaletteManager: () => void;
  onShowToast: (message: string) => void;
  colors: string[];
  pairs: Array<{ fg: string; bg: string; ratio: number; passes: string[] }>;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onAnalyze,
  onGenerate,
  onExport,
  onToggleTheme,
  onOpenPaletteManager,
  onShowToast,
  colors,
  pairs,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [seq, setSeq] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandsListRef = useRef<HTMLDivElement>(null);
  const seqTimerRef = useRef<number | null>(null);
  const SEQ_WINDOW_MS = 900;

  const resetSeq = useCallback(() => {
    if (seqTimerRef.current) {
      window.clearTimeout(seqTimerRef.current);
      seqTimerRef.current = null;
    }
    setSeq([]);
  }, []);

  const pushKeyToSeq = useCallback((k: string) => {
    setSeq((prev) => {
      const next = [...prev, k];
      if (seqTimerRef.current) window.clearTimeout(seqTimerRef.current);
      seqTimerRef.current = window.setTimeout(() => setSeq([]), SEQ_WINDOW_MS);
      return next.slice(-2); // soporta secuencias de hasta 2 teclas
    });
  }, []);

  // ----- Comandos disponibles -----
  const commands: Command[] = useMemo(() => [
    // Análisis
    {
      id: 'analyze-current',
      title: 'Analizar Paleta Actual',
      description: 'Ejecuta análisis WCAG completo de la paleta actual',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      action: onAnalyze,
      category: 'analysis',
      keys: ['a'],
      shortcut: 'a',
    },
    {
      id: 'analyze-wcag',
      title: 'Cambiar Estándar WCAG',
      description: 'Cambia entre AA Normal, AA Large y AAA Normal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => {
        const wcagElement = document.querySelector('[data-wcag-selector]');
        if (wcagElement) {
          wcagElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const firstButton = wcagElement.querySelector('button');
            if (firstButton) (firstButton as HTMLElement).focus();
          }, 300);
        }
        onClose();
      },
      category: 'analysis',
      keys: ['w'],
      shortcut: 'w',
    },

    // Generación
    {
      id: 'generate-palette',
      title: 'Generar Nueva Paleta',
      description: 'Limpia la paleta actual y abre el generador',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      action: () => {
        const addColorModal =
          document.querySelector('[data-add-color-panel]') ||
          document.querySelector('[role="dialog"]') ||
          document.querySelector('div[aria-label*="color" i]');
        if (addColorModal) {
          const closeBtn =
            addColorModal.querySelector('button[aria-label*="cerrar" i]') ||
            addColorModal.querySelector('button[data-close]') ||
            addColorModal.querySelector('button:last-child');
          if (closeBtn) (closeBtn as HTMLElement).click();
        }

        const clearButton =
          document.querySelector('button[data-clear-palette]') ||
          document.querySelector('button[aria-label*="limpiar" i]') ||
          document.querySelector('button[title*="limpiar" i]');
        if (clearButton) (clearButton as HTMLElement).click();

        setTimeout(() => {
          const paletteArea =
            document.querySelector('[data-palette-area]') ||
            document.querySelector('.palette-area') ||
            document.querySelector('#palette-area') ||
            document.querySelector('[class*="palette"]') ||
            document.querySelector('div[class*="grid"][class*="gap"]');

          if (paletteArea) {
            (paletteArea as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          setTimeout(() => onGenerate(), 1000);
        }, 250);
      },
      category: 'generation',
      keys: ['g', 'e'], // g e
      shortcut: 'g e',
    },
    {
      id: 'add-color',
      title: 'Agregar Color',
      description: 'Abre la sección para agregar un nuevo color',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: () => {
        const isVisible = (el: Element | null) => {
          if (!el) return false;
          const he = el as HTMLElement;
          if (he.offsetWidth > 0 || he.offsetHeight > 0) return true;
          const rects = he.getClientRects?.();
          return !!rects && rects.length > 0;
        };

        const scrollCenter = (el: Element) => {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        };

        function waitFor<T>(fn: () => T | null, timeoutMs = 1200, intervalMs = 40): Promise<T | null> {
          return new Promise((resolve) => {
            const start = performance.now();
            const tick = () => {
              const res = fn();
              if (res) return resolve(res);
              if (performance.now() - start >= timeoutMs) return resolve(null);
              setTimeout(tick, intervalMs);
            };
            tick();
          });
        }

        const fireMouseSequence = (el: Element) => {
          const he = el as HTMLElement;
          const r = he.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const y = r.top + r.height / 2;
          const mk = (type: string) =>
            new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
          he.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
          he.dispatchEvent(mk('mousedown'));
          he.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
          he.dispatchEvent(mk('mouseup'));
          he.dispatchEvent(mk('click'));
        };

        const pressEnter = (el: Element) => {
          const he = el as HTMLElement;
          he.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
          he.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
        };

        const pickPanel = () =>
          document.querySelector('[data-add-color-panel]') ||
          document.querySelector('[role="dialog"]') ||
          document.querySelector('div[aria-label*="color" i]');

        const pickButton = () =>
          document.querySelector('[data-add-color]') ||
          document.getElementById('add-color-button') ||
          document.querySelector('button[aria-label*="Agregar"][aria-label*="color" i]');

        const focusFirstInput = (panel: Element) => {
          const input =
            panel.querySelector('[data-color-input]') ||
            panel.querySelector('input, [role="textbox"], [contenteditable="true"]');
          (input as HTMLElement | null)?.focus();
        };

        const revealAddColor = async () => {
          await waitFor(() => !document.querySelector('[data-command-palette-overlay]'), 800, 40);
          let panel = pickPanel();
          if (panel && isVisible(panel)) {
            scrollCenter(panel);
            setTimeout(() => focusFirstInput(panel as Element), 150);
            return;
          }
          const btn = pickButton();
          if (!btn) return;
          scrollCenter(btn);
          (btn as HTMLElement).focus();
          await new Promise((r) => setTimeout(r, 200));
          fireMouseSequence(btn);

          panel = await waitFor(() => {
            const p = pickPanel();
            return p && isVisible(p) ? p : null;
          }, 1500, 50);

          if (!panel) {
            pressEnter(btn);
            panel = await waitFor(() => {
              const p = pickPanel();
              return p && isVisible(p) ? p : null;
            }, 800, 40);
          }

          if (panel) {
            scrollCenter(panel);
            setTimeout(() => focusFirstInput(panel as Element), 150);
          }
        };

        onClose();
        setTimeout(() => revealAddColor(), 0);
      },
      category: 'generation',
      keys: ['c', 'o'], // c o
      shortcut: 'c o',
    },

    // Exportación
    {
      id: 'export-css',
      title: 'Exportar CSS',
      description: 'Exporta la paleta en formato CSS',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      action: onExport,
      category: 'export',
      keys: ['e', 'c'],
      shortcut: 'e c',
    },
    {
      id: 'export-figma',
      title: 'Exportar para Figma',
      description: 'Exporta en formato compatible con Figma',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => {
        onExport();
        setTimeout(() => {
          const figmaTab = document.querySelector('[data-tab="figma"]');
          if (figmaTab) (figmaTab as HTMLElement).click();
        }, 100);
        onClose();
      },
      category: 'export',
      keys: ['e', 'f'],
      shortcut: 'e f',
    },

    // Navegación
    {
      id: 'copy-palette',
      title: 'Copiar Paleta',
      description: 'Copia la paleta actual al portapapeles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        const paletteText = colors.join(', ');
        navigator.clipboard.writeText(paletteText);
        onShowToast('Paleta copiada al portapapeles');
        onClose();
      },
      category: 'navigation',
      keys: ['p'],
      shortcut: 'p',
    },
    {
      id: 'copy-results',
      title: 'Copiar Resultados',
      description: 'Copia las combinaciones accesibles encontradas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => {
        const resultsText = pairs
          .map((p) => `${p.fg} on ${p.bg} - Ratio: ${p.ratio}`)
          .join('\n');
        navigator.clipboard.writeText(resultsText);
        onShowToast('Resultados copiados al portapapeles');
        onClose();
      },
      category: 'navigation',
      keys: ['r'],
      shortcut: 'r',
    },

    // Almacenamiento
    {
      id: 'save-palette',
      title: 'Guardar Paleta',
      description: 'Guarda la paleta actual en el almacenamiento local',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      action: onOpenPaletteManager,
      category: 'storage',
      keys: ['s'],
      shortcut: 's',
    },
    {
      id: 'load-palette',
      title: 'Cargar Paleta',
      description: 'Carga una paleta guardada anteriormente',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      action: onOpenPaletteManager,
      category: 'storage',
      keys: ['l'],
      shortcut: 'l',
    },

    // Configuración
    {
      id: 'toggle-theme',
      title: 'Cambiar Tema',
      description: 'Alterna entre tema claro y oscuro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      action: onToggleTheme,
      category: 'settings',
      keys: ['t'],
      shortcut: 't',
    },
    {
      id: 'open-docs',
      title: 'Abrir Documentación',
      description: 'Abre la documentación de ColorCheck',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      action: () => {
        const docsButton = document.querySelector('[data-docs-button]');
        if (docsButton) (docsButton as HTMLElement).click();
        onClose();
      },
      category: 'settings',
      keys: ['d'],
      shortcut: 'd',
    },
  ], [onAnalyze, onClose, onGenerate, onExport, onToggleTheme, onOpenPaletteManager, onShowToast, colors, pairs]);

  // Filtrar comandos según búsqueda
  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  );

  // Scroll al item seleccionado
  const scrollToSelected = useCallback((index: number) => {
    if (commandsListRef.current && index >= 0) {
      const selectedElement = commandsListRef.current.children[index] as HTMLElement;
      if (selectedElement) {
        const scrollContainer = commandsListRef.current.parentElement;
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = selectedElement.getBoundingClientRect();
          const isAbove = elementRect.top < containerRect.top;
          const isBelow = elementRect.bottom > containerRect.bottom;
          if (isAbove || isBelow) {
            selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        }
      }
    }
  }, []);

  // Navegación con flechas/Enter/Escape dentro del input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : selectedIndex;
        setSelectedIndex(nextIndex);
        scrollToSelected(nextIndex);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : selectedIndex;
        setSelectedIndex(prevIndex);
        scrollToSelected(prevIndex);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClose();
        break;
      }
    }
  };

  // Focus input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Reset índice al cambiar búsqueda y resetear secuencia si el usuario está escribiendo
  useEffect(() => {
    setSelectedIndex(0);
    // Si el usuario empieza a escribir, resetear la secuencia de comandos
    if (query && query.length > 0) {
      resetSeq();
    }
  }, [query, resetSeq]);

  // Scroll cuando cambia seleccionado
  useEffect(() => {
    if (filteredCommands.length > 0) {
      scrollToSelected(selectedIndex);
    }
  }, [selectedIndex, filteredCommands.length, scrollToSelected]);

  // Capturar secuencias mientras el palette está abierto y query vacío
  useEffect(() => {
    if (!isOpen) return;

    const isPlainChar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      const k = e.key.toLowerCase();
      return k.length === 1 && /[a-z0-9]/.test(k);
    };

    const handleSeqKey = (e: KeyboardEvent) => {
      // Si el usuario está escribiendo en el input, no interceptar teclas
      if (query && query.length > 0) return;
      
      // Si el input tiene foco, no interceptar teclas de caracteres
      if (inputRef.current && document.activeElement === inputRef.current) {
        return;
      }
      
      if (!isPlainChar(e)) return;

      const k = e.key.toLowerCase();
      e.preventDefault();
      e.stopPropagation();

      // usar la secuencia "inmediata" para el match del frame actual
      const current = [...seq, k];
      // match exacto
      const exact = commands.find(c => c.keys && c.keys.join(' ') === current.join(' '));
      if (exact) {
        exact.action();
        onClose();
        resetSeq();
        return;
      }
      // ¿hay algún prefijo que coincida?
      const hasPrefix = commands.some(c => {
        if (!c.keys) return false;
        const expected = c.keys.slice(0, current.length).join(' ');
        return expected === current.join(' ');
      });

      if (hasPrefix) {
        // aceptamos y esperamos la siguiente tecla
        pushKeyToSeq(k);
      } else {
        // no coincide: reiniciar y arrancar con esta tecla por si inicia otra secuencia
        resetSeq();
        pushKeyToSeq(k);
      }
    };

    window.addEventListener('keydown', handleSeqKey, { capture: true });
    return () => window.removeEventListener('keydown', handleSeqKey, true);
  }, [isOpen, query, seq, commands, onClose, pushKeyToSeq, resetSeq]);

  if (!isOpen) return null;

  return (
    <div
      data-command-palette-overlay
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-2xl w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <div className="w-8 h-8 flex items-center justify-center bg-[var(--primary)]/10 rounded-lg">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Paleta de Comandos</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Busca y ejecuta comandos rápidamente</p>
          </div>


          <button
            onClick={onClose}
            className="ml-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input de búsqueda */}
        <div className="p-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar comandos o usar atajos de teclado..."
              className="w-full px-4 py-3 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lista de comandos */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <div className="text-4xl mb-3">🔍</div>
              <p>No se encontraron comandos</p>
              <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="p-2" ref={commandsListRef}>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => {
                    command.action();
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/20'
                      : 'hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[var(--muted-foreground)]">{command.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--foreground)]">{command.title}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">{command.description}</div>
                    </div>

                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-4">
              <span>⌘K / Ctrl+K o Ctrl+Space</span>
              <span>↑↓ Navegar</span>
              <span>↵ Ejecutar</span>
              <span>Esc Cerrar</span>
            </div>
            <div>{filteredCommands.length} comando{filteredCommands.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

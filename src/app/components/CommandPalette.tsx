'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  category: 'analysis' | 'generation' | 'export' | 'navigation' | 'settings';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onToggleTheme: () => void;
  colors: string[];
  pairs: Array<{fg: string; bg: string; ratio: number; passes: string[]}>;
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onAnalyze, 
  onGenerate, 
  onExport, 
  onToggleTheme,
  colors,
  pairs
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandsListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Comandos disponibles
  const commands: Command[] = [
    // Análisis
    {
      id: 'analyze-current',
      title: 'Analizar Paleta Actual',
      description: 'Ejecuta análisis WCAG completo de la paleta actual',
      icon: '📊',
      action: onAnalyze,
      shortcut: 'Ctrl+K → A',
      category: 'analysis'
    },
    {
      id: 'analyze-wcag',
      title: 'Cambiar Estándar WCAG',
      description: 'Cambia entre AA Normal, AA Large y AAA Normal',
      icon: '🎯',
      action: () => {
        // Lógica para cambiar estándar WCAG
        console.log('Cambiar estándar WCAG');
      },
      shortcut: 'Ctrl+K → W',
      category: 'analysis'
    },
    
    // Generación
    {
      id: 'generate-palette',
      title: 'Generar Nueva Paleta',
      description: 'Abre el generador de paletas armónicas',
      icon: '🎨',
      action: onGenerate,
      shortcut: 'Ctrl+K → G',
      category: 'generation'
    },
    {
      id: 'add-color',
      title: 'Agregar Color',
      description: 'Agrega un nuevo color a la paleta',
      icon: '➕',
      action: () => {
        // Lógica para agregar color
        console.log('Agregar color');
      },
      shortcut: 'Ctrl+K → C',
      category: 'generation'
    },
    
    // Exportación
    {
      id: 'export-css',
      title: 'Exportar CSS',
      description: 'Exporta la paleta en formato CSS',
      icon: '🎨',
      action: onExport,
      shortcut: 'Ctrl+K → E',
      category: 'export'
    },
    {
      id: 'export-figma',
      title: 'Exportar para Figma',
      description: 'Exporta en formato compatible con Figma',
      icon: '🎯',
      action: () => {
        // Lógica específica para Figma
        console.log('Exportar para Figma');
      },
      shortcut: 'Ctrl+K → F',
      category: 'export'
    },
    
    // Navegación
    {
      id: 'copy-palette',
      title: 'Copiar Paleta',
      description: 'Copia la paleta actual al portapapeles',
      icon: '📋',
      action: () => {
        const paletteText = colors.join(', ');
        navigator.clipboard.writeText(paletteText);
        onClose();
      },
      shortcut: 'Ctrl+K → P',
      category: 'navigation'
    },
    {
      id: 'copy-results',
      title: 'Copiar Resultados',
      description: 'Copia las combinaciones accesibles encontradas',
      icon: '📄',
      action: () => {
        const resultsText = pairs.map(p => `${p.fg} on ${p.bg} - Ratio: ${p.ratio}`).join('\n');
        navigator.clipboard.writeText(resultsText);
        onClose();
      },
      shortcut: 'Ctrl+K → R',
      category: 'navigation'
    },
    
    // Configuración
    {
      id: 'toggle-theme',
      title: 'Cambiar Tema',
      description: 'Alterna entre tema claro y oscuro',
      icon: '🌙',
      action: onToggleTheme,
      shortcut: 'Ctrl+K → T',
      category: 'settings'
    },
    {
      id: 'open-docs',
      title: 'Abrir Documentación',
      description: 'Abre la documentación de ColorCheck',
      icon: '📚',
      action: () => {
        // Lógica para abrir docs
        console.log('Abrir documentación');
      },
      shortcut: 'Ctrl+K → D',
      category: 'settings'
    }
  ];

  // Filtrar comandos basado en la búsqueda
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  );

  // Función para hacer scroll al elemento seleccionado
  const scrollToSelected = (index: number) => {
    if (commandsListRef.current && index >= 0 && index < filteredCommands.length) {
      const selectedElement = commandsListRef.current.children[index] as HTMLElement;
      if (selectedElement) {
        // Obtener el contenedor scrolleable
        const scrollContainer = commandsListRef.current.parentElement;
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = selectedElement.getBoundingClientRect();
          
          // Verificar si el elemento está fuera de la vista
          const isAbove = elementRect.top < containerRect.top;
          const isBelow = elementRect.bottom > containerRect.bottom;
          
          if (isAbove || isBelow) {
            selectedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest'
            });
          }
        }
      }
    }
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(nextIndex);
        scrollToSelected(nextIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredCommands.length - 1;
        setSelectedIndex(prevIndex);
        scrollToSelected(prevIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Efecto para enfocar el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Efecto para resetear el índice cuando cambia la búsqueda
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Efecto para hacer scroll cuando cambia el índice seleccionado
  useEffect(() => {
    if (filteredCommands.length > 0) {
      scrollToSelected(selectedIndex);
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!isOpen) return null;

  return (
    <div 
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
            <span className="text-lg">⚡</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Paleta de Comandos
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Busca y ejecuta comandos rápidamente
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
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
              placeholder="Buscar comandos..."
              className="w-full px-4 py-3 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                    <span className="text-lg">{command.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--foreground)]">
                        {command.title}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {command.description}
                      </div>
                    </div>
                    {command.shortcut && (
                      <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                        {command.shortcut}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer con atajos */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Ejecutar</span>
              <span>Esc Cerrar</span>
            </div>
            <div>
              {filteredCommands.length} comando{filteredCommands.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

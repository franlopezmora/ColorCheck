"use client";
import { useState } from "react";
import ColorPicker from "./ColorPicker";

interface ColorPaletteProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  onShowToast?: (message: string) => void;
}

export default function ColorPalette({ colors, onChange, onShowToast }: ColorPaletteProps) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [editingColors, setEditingColors] = useState<Record<number, string | undefined>>({});
  const [bulkText, setBulkText] = useState("");

  function addColor() {
    if (newColor && !colors.includes(newColor)) {
      onChange([...colors, newColor]);
      setNewColor("#000000");
      setShowAddColor(false);
    }
  }

  function removeColor(index: number) {
    const newColors = colors.filter((_, i) => i !== index);
    onChange(newColors);
  }

  function updateColor(index: number, color: string) {
    const newColors = [...colors];
    newColors[index] = color;
    onChange(newColors);
  }

  function clearAll() {
    onChange([]);
  }

  function generateRandomPalette() {
    const randomColors = Array.from({ length: 5 }, () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });
    onChange(randomColors);
  }

  function getContrastColor(hexColor: string): string {
    // Convertir hex a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calcular luminancia relativa
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retornar blanco o negro basado en luminancia
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Paleta de Colores ({colors.length} colores)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateRandomPalette}
            className="px-3 py-1 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/30 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
            aria-label="Generar paleta de colores aleatoria"
          >
            Aleatorio
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 text-xs bg-[var(--destructive)]/20 text-[var(--destructive)] rounded-lg hover:bg-[var(--destructive)]/30 focus:ring-2 focus:ring-[var(--destructive)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
            aria-label="Limpiar todos los colores de la paleta"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Horizontal Color Palette */}
      <div className="flex flex-wrap gap-4 p-4">
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-3 p-3 border border-[var(--border)] rounded-lg bg-[var(--card)] group"
            role="listitem"
          >
            {/* Color Picker */}
            <div className="relative w-12 h-12">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Selector de color"
              />
              <div 
                className="w-full h-full rounded-lg border border-[var(--border)] cursor-pointer"
                style={{ 
                  backgroundColor: color,
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Hex Input */}
            <input
              type="text"
              value={editingColors[index] !== undefined ? editingColors[index] : color}
              onChange={(e) => {
                const value = e.target.value;
                setEditingColors(prev => ({ ...prev, [index]: value }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    updateColor(index, value);
                    setEditingColors(prev => ({ ...prev, [index]: undefined }));
                    e.currentTarget.blur();
                  } else if (/^[0-9a-fA-F]{6}$/.test(value)) {
                    updateColor(index, '#' + value);
                    setEditingColors(prev => ({ ...prev, [index]: undefined }));
                    e.currentTarget.blur();
                  }
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                  updateColor(index, value);
                } else if (/^[0-9a-fA-F]{6}$/.test(value)) {
                  updateColor(index, '#' + value);
                }
                setEditingColors(prev => ({ ...prev, [index]: undefined }));
              }}
              onFocus={() => {
                setEditingColors(prev => ({ ...prev, [index]: color }));
              }}
              className="w-12 h-12 px-1 text-xs font-mono bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              placeholder="#000000"
              title="Código hex (Enter para confirmar)"
            />

            {/* Label and Hex Code */}
            <div className="flex flex-col space-y-1">
              <div className="text-sm text-[var(--muted-foreground)]">
                Color {index + 1}
              </div>
              <div 
                className="text-xs font-mono px-2 py-1 rounded border border-[var(--border)] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  navigator.clipboard.writeText(color);
                  onShowToast?.(`Color ${color} copiado al portapapeles`);
                }}
                title="Click para copiar"
                style={{ 
                  backgroundColor: color, 
                  color: getContrastColor(color) 
                }}
              >
                {color}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeColor(index)}
              className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]/20"
              title="Eliminar color"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Color Button */}
        <div 
          className="flex items-center space-x-3 p-3 border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 transition-colors cursor-pointer group"
          onClick={() => setShowAddColor(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowAddColor(true);
            }
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg group-hover:border-[var(--primary)] transition-colors">
            <svg className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
            Agregar
          </span>
        </div>
      </div>

      {/* Add Color Section */}
      {showAddColor ? (
        <div 
          className="p-4 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]"
          role="dialog"
          aria-label="Agregar nuevo color"
        >
          <div className="space-y-3">
            <ColorPicker
              value={newColor}
              onChange={setNewColor}
              label="Nuevo Color"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={addColor}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
                aria-label={`Agregar color ${newColor} a la paleta`}
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddColor(false)}
                className="px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 focus:ring-2 focus:ring-[var(--muted-foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
                aria-label="Cancelar agregar color"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddColor(true)}
          className="w-full py-3 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
          aria-label="Agregar un nuevo color a la paleta"
          data-add-color
        >
          + Agregar Color
        </button>
      )}

      {/* Text Input for Bulk Colors */}
      <div className="space-y-2 p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          O pega colores aquí (uno por línea o separados por espacios)
        </label>
        <textarea
          value={bulkText || colors.join('\n')}
          onChange={(e) => {
            setBulkText(e.target.value);
          }}
          onBlur={() => {
            // Procesar colores al perder el foco
            if (bulkText.trim()) {
              const newColors = bulkText
                .split(/[\n\s]+/) // Separar por líneas Y espacios
                .map(color => color.trim())
                .filter(color => color && /^#?[0-9a-fA-F]{3,6}$/.test(color))
                .map(color => color.startsWith('#') ? color : '#' + color);
              onChange(newColors);
            }
            setBulkText("");
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              // Ctrl+Enter para procesar inmediatamente
              if (bulkText.trim()) {
                const newColors = bulkText
                  .split(/[\n\s]+/) // Separar por líneas Y espacios
                  .map(color => color.trim())
                  .filter(color => color && /^#?[0-9a-fA-F]{3,6}$/.test(color))
                  .map(color => color.startsWith('#') ? color : '#' + color);
                onChange(newColors);
              }
              setBulkText("");
              e.preventDefault();
            }
          }}
          placeholder="Ingresa tus colores HEX, uno por línea o separados por espacios...&#10;Presiona Ctrl+Enter para aplicar o haz click fuera para confirmar"
          className="w-full h-24 p-3 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none font-mono text-sm"
          aria-label="Área de texto para ingresar múltiples colores HEX"
        />
        <div className="text-xs text-[var(--muted-foreground)]">
          Presiona <kbd className="px-1.5 py-0.5 text-xs bg-[var(--muted)] border border-[var(--border)] rounded font-mono">Enter</kbd> libremente para crear nuevas líneas. Usa <kbd className="px-1.5 py-0.5 text-xs bg-[var(--muted)] border border-[var(--border)] rounded font-mono">Ctrl+Enter</kbd> para aplicar cambios o haz click fuera del área.
        </div>
      </div>
    </div>
  );
}

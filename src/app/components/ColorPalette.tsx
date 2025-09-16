"use client";
import { useState } from "react";
import ColorPicker from "./ColorPicker";

interface ColorPaletteProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorPalette({ colors, onChange }: ColorPaletteProps) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [editingColors, setEditingColors] = useState<Record<number, string>>({});
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
      <div className="flex flex-wrap gap-4 items-start p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center space-y-2 group"
            role="listitem"
          >
            {/* Color Swatch */}
            <div className="relative">
              <div className="flex gap-1">
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
                    className="w-full h-full rounded-lg border-2 border-[var(--border)] cursor-pointer"
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
                      // Validar y formatear al presionar Enter
                      const value = e.currentTarget.value;
                      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                        updateColor(index, value);
                        setEditingColors(prev => ({ ...prev, [index]: undefined }));
                        e.currentTarget.blur();
                      } else if (/^[0-9a-fA-F]{6}$/.test(value)) {
                        // Si falta el #, agregarlo
                        updateColor(index, '#' + value);
                        setEditingColors(prev => ({ ...prev, [index]: undefined }));
                        e.currentTarget.blur();
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Validar y formatear al perder el foco
                    const value = e.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                      updateColor(index, value);
                    } else if (/^[0-9a-fA-F]{6}$/.test(value)) {
                      updateColor(index, '#' + value);
                    }
                    // Limpiar el estado de edición
                    setEditingColors(prev => ({ ...prev, [index]: undefined }));
                  }}
                  onFocus={() => {
                    // Al hacer focus, inicializar con el color actual
                    setEditingColors(prev => ({ ...prev, [index]: color }));
                  }}
                  className="w-12 h-12 px-1 text-xs font-mono bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  placeholder="#000000"
                  title="Código hex (Enter para confirmar)"
                />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeColor(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--destructive)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--destructive)]/80 focus:opacity-100 focus:ring-2 focus:ring-[var(--destructive)] focus:ring-offset-2"
                title="Eliminar color"
                aria-label={`Eliminar color ${color}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Color Label - Simple, no editable */}
            <div className="px-3 py-1 text-xs text-[var(--muted-foreground)] min-w-[60px] text-center">
              Color {index + 1}
            </div>

            {/* Hex Code */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(color);
                // Aquí podrías mostrar un toast de confirmación
              }}
              className="px-3 py-1 text-xs font-mono bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              style={{ backgroundColor: color, color: getContrastColor(color) }}
              title="Click para copiar código hex"
            >
              {color.toUpperCase()}
            </button>
          </div>
        ))}

        {/* Add New Color Button */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-12 h-12">
            <button
              onClick={() => setShowAddColor(true)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Agregar nuevo color"
            />
            <div 
              className="w-full h-full border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
              style={{ borderRadius: '8px' }}
            >
              <svg 
                className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div className="px-3 py-1 text-xs text-[var(--muted-foreground)]">
            Agregar
          </div>
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
          💡 Presiona Enter libremente para crear nuevas líneas. Usa Ctrl+Enter para aplicar cambios o haz click fuera del área.
        </div>
      </div>
    </div>
  );
}

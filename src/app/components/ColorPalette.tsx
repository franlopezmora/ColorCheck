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

  return (
    <div className="space-y-4">
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

      {/* Color List */}
      <div 
        className="space-y-3"
        role="list"
        aria-label="Lista de colores en la paleta"
      >
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[var(--muted)] rounded-lg"
            role="listitem"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg border-2 border-[var(--border)] flex-shrink-0"
                style={{ backgroundColor: color }}
                aria-label={`Vista previa del color ${color}`}
              />
              <button
                onClick={() => removeColor(index)}
                className="p-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 focus:ring-2 focus:ring-[var(--destructive)] focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-lg transition-colors"
                title="Eliminar color"
                aria-label={`Eliminar color ${color} de la paleta`}
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
            <div className="flex-1">
              <ColorPicker
                value={color}
                onChange={(newColor) => updateColor(index, newColor)}
                label={`Color ${index + 1}`}
              />
            </div>
          </div>
        ))}
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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          O pega colores aquí (uno por línea o separados por espacios)
        </label>
        <textarea
          value={colors.join('\n')}
          onChange={(e) => {
            const newColors = e.target.value.split(/\s+/).filter(Boolean);
            onChange(newColors);
          }}
          placeholder="Ingresa tus colores HEX, uno por línea o separados por espacios..."
          className="w-full h-24 p-3 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none font-mono text-sm"
          aria-label="Área de texto para ingresar múltiples colores HEX"
        />
      </div>
    </div>
  );
}

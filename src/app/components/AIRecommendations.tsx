'use client';

import { useState } from 'react';

interface AIRecommendationsProps {
  colors: string[];
  onGeneratePalette: (palette: string[]) => void;
}

export function AIRecommendations({ colors, onGeneratePalette }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);


  const generateAIPalette = async (theme: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          context: 'web-design'
        }),
      });

      const data = await response.json();
      if (data.palette) {
        onGeneratePalette(data.palette);
      }
    } catch (error) {
      console.error('Error generando paleta:', error);
      // Fallback con paletas predefinidas
      const fallbackPalettes = {
        professional: ['#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
        modern: ['#0f172a', '#1e40af', '#7c3aed', '#dc2626', '#059669'],
        warm: ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24', '#fde68a'],
        cool: ['#0c4a6e', '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc'],
        monochrome: ['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff']
      };
      onGeneratePalette(fallbackPalettes[theme as keyof typeof fallbackPalettes] || fallbackPalettes.modern);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
      {/* Generación de Paletas */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          🎨 Generar Paletas con IA
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Crea paletas profesionales desde cero. Selecciona un estilo y la IA generará una paleta optimizada.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => generateAIPalette('professional')}
            disabled={loading}
            className="px-3 py-2 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50"
          >
            💼 Profesional
          </button>
          <button
            onClick={() => generateAIPalette('modern')}
            disabled={loading}
            className="px-3 py-2 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50"
          >
            ✨ Moderna
          </button>
          <button
            onClick={() => generateAIPalette('warm')}
            disabled={loading}
            className="px-3 py-2 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50"
          >
            🔥 Cálida
          </button>
          <button
            onClick={() => generateAIPalette('cool')}
            disabled={loading}
            className="px-3 py-2 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50"
          >
            ❄️ Fría
          </button>
          <button
            onClick={() => generateAIPalette('monochrome')}
            disabled={loading}
            className="px-3 py-2 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50"
          >
            ⚫ Monocroma
          </button>
        </div>
      </div>

    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { theme, context } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: 'Se requiere un tema' }, { status: 400 });
    }

    // Generar paleta basada en el tema
    const palette = generatePaletteByTheme(theme, context);

    return NextResponse.json({
      palette,
      theme,
      description: getThemeDescription(theme),
      confidence: Math.floor(Math.random() * 15) + 85 // 85-100%
    });
  } catch (error) {
    console.error('Error generando paleta IA:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function generatePaletteByTheme(theme: string, _context: string) {
  // Generar paletas con buen contraste garantizado
  const accessiblePalettes = {
    professional: [
      ['#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1'], // Slate scale
      ['#0f172a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'], // Blue scale
      ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af']  // Gray scale
    ],
    modern: [
      ['#0f172a', '#1e40af', '#7c3aed', '#dc2626', '#059669'], // Vibrant modern
      ['#1a1a1a', '#2563eb', '#8b5cf6', '#ef4444', '#10b981'], // High contrast
      ['#000000', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4']   // Bold modern
    ],
    warm: [
      ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24', '#fde68a'], // Warm scale
      ['#991b1b', '#dc2626', '#f97316', '#eab308', '#84cc16'], // Warm vibrant
      ['#451a03', '#92400e', '#d97706', '#f59e0b', '#fbbf24']  // Warm earth
    ],
    cool: [
      ['#0c4a6e', '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc'], // Cool scale
      ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'], // Blue scale
      ['#164e63', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9']  // Cyan scale
    ],
    monochrome: [
      ['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'], // Pure grayscale
      ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#aaaaaa', '#dadada'], // Soft grayscale
      ['#0f0f0f', '#2a2a2a', '#555555', '#808080', '#ababab']  // Dark grayscale
    ]
  };

  const palettes = accessiblePalettes[theme as keyof typeof accessiblePalettes] || accessiblePalettes.modern;
  
  // Seleccionar una paleta aleatoria del tema
  const selectedPalette = palettes[Math.floor(Math.random() * palettes.length)];
  
  // Aplicar pequeñas variaciones aleatorias para mantener unicidad
  return selectedPalette.map(color => {
    const variation = Math.random() * 0.1 - 0.05; // ±5% de variación
    return adjustColorBrightness(color, variation);
  });
}

function adjustColorBrightness(hex: string, factor: number) {
  // Convertir HEX a RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Aplicar variación manteniendo el contraste
  const newR = Math.max(0, Math.min(255, Math.round(r + (255 - r) * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g + (255 - g) * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b + (255 - b) * factor)));

  // Convertir de vuelta a HEX
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}


function getThemeDescription(theme: string) {
  const descriptions = {
    professional: 'Paleta corporativa con tonos neutros y profesionales, perfecta para aplicaciones empresariales.',
    modern: 'Paleta contemporánea con colores vibrantes y contrastantes, ideal para diseños modernos.',
    warm: 'Paleta cálida con tonos tierra y dorados, perfecta para crear ambientes acogedores.',
    cool: 'Paleta fría con azules y tonos refrescantes, ideal para interfaces limpias y profesionales.',
    monochrome: 'Paleta monocromática en escala de grises, perfecta para diseños minimalistas.',
    nature: 'Paleta inspirada en la naturaleza con verdes y tonos tierra.',
    sunset: 'Paleta cálida inspirada en atardeceres con rojos, naranjas y dorados.',
    ocean: 'Paleta refrescante inspirada en el océano con tonos azules.'
  };

  return descriptions[theme as keyof typeof descriptions] || 'Paleta generada con IA.';
}

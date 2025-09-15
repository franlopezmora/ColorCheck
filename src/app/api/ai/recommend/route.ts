import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { colors, theme, context } = await request.json();

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json({ error: 'Se requieren colores válidos' }, { status: 400 });
    }

    // Simulamos una respuesta de IA por ahora (sin API key real)
    const recommendations = await generateAIRecommendations(colors, theme, context);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error en recomendaciones IA:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function generateAIRecommendations(colors: string[], theme: string, context: string) {
  // Por ahora simulamos respuestas inteligentes basadas en reglas
  // En producción aquí iría la llamada real a OpenAI
  
  const colorAnalysis = analyzeColorPalette(colors);
  const recommendations = [];

  // Análisis de accesibilidad
  if (colorAnalysis.hasLowContrast) {
    recommendations.push({
      type: 'accessibility',
      title: '🚨 Problemas de Accesibilidad',
      description: 'Algunos colores tienen bajo contraste. Te recomendamos ajustar los tonos para cumplir WCAG AA.',
      action: 'Mejorar contraste',
      priority: 'high'
    });
  }

  // Recomendaciones de armonía
  if (colorAnalysis.isMonochromatic) {
    recommendations.push({
      type: 'harmony',
      title: '🎨 Paleta Monocromática',
      description: 'Tu paleta es monocromática. ¿Te gustaría explorar variaciones con colores complementarios?',
      action: 'Agregar colores complementarios',
      priority: 'medium'
    });
  }

  // Sugerencias temáticas
  const themeSuggestions = getThemeSuggestions(theme, context);
  recommendations.push(...themeSuggestions);

  // Recomendaciones de tendencias
  recommendations.push({
    type: 'trends',
    title: '✨ Tendencias 2024',
    description: 'Los colores neutros y tonos tierra están muy de moda. ¿Quieres probar una paleta más moderna?',
    action: 'Aplicar tendencias',
    priority: 'low'
  });

  // Calcular confianza basada en la paleta (consistente)
  const confidence = calculateConfidence(colors, recommendations);

  return {
    recommendations,
    summary: `Analicé tu paleta de ${colors.length} colores y encontré ${recommendations.length} oportunidades de mejora.`,
    confidence
  };
}

function analyzeColorPalette(colors: string[]) {
  // Análisis básico de la paleta
  const hasLowContrast = colors.some(color => {
    // Simulación: algunos colores específicos tienen bajo contraste
    return ['#000000', '#333333', '#666666'].includes(color.toLowerCase());
  });

  const isMonochromatic = colors.every(color => {
    // Simulación: si todos los colores son tonos de gris
    return color.toLowerCase().match(/^#[0-9a-f]{6}$/) && 
           color.toLowerCase().startsWith('#') &&
           color.toLowerCase().slice(1, 3) === color.toLowerCase().slice(3, 5) &&
           color.toLowerCase().slice(3, 5) === color.toLowerCase().slice(5, 7);
  });

  return { hasLowContrast, isMonochromatic };
}

function getThemeSuggestions(theme: string, context: string) {
  const suggestions = [];

  if (theme === 'dark') {
    suggestions.push({
      type: 'theme',
      title: '🌙 Modo Oscuro Optimizado',
      description: 'Para modo oscuro, considera usar tonos más cálidos y menos saturados.',
      action: 'Optimizar para oscuro',
      priority: 'medium'
    });
  }

  if (context === 'professional') {
    suggestions.push({
      type: 'context',
      title: '💼 Estilo Profesional',
      description: 'Para un look más corporativo, te sugiero colores más neutros y sobrios.',
      action: 'Aplicar estilo corporativo',
      priority: 'medium'
    });
  }

  return suggestions;
}

function calculateConfidence(colors: string[], recommendations: any[]) {
  // Calcular confianza basada en características de la paleta
  let baseConfidence = 85; // Confianza base
  
  // Más colores = más confianza (hasta cierto punto)
  if (colors.length >= 3 && colors.length <= 5) {
    baseConfidence += 5;
  } else if (colors.length > 5) {
    baseConfidence += 2;
  }
  
  // Menos recomendaciones = más confianza
  if (recommendations.length <= 2) {
    baseConfidence += 5;
  } else if (recommendations.length >= 4) {
    baseConfidence -= 3;
  }
  
  // Verificar si tiene colores comunes/profesionales
  const professionalColors = ['#000000', '#ffffff', '#333333', '#666666', '#999999', '#cccccc'];
  const hasProfessionalColors = colors.some(color => 
    professionalColors.includes(color.toLowerCase())
  );
  
  if (hasProfessionalColors) {
    baseConfidence += 3;
  }
  
  // Limitar entre 80-98%
  return Math.max(80, Math.min(98, baseConfidence));
}

'use client';

import { useState } from 'react';
import Modal from './Modal';

interface ColorPair {
  fg: string;
  bg: string;
  ratio: number;
  passes: string[];
}

interface ExportPanelProps {
  pairs: ColorPair[];
  colors: string[];
  threshold: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export default function ExportPanel({ pairs, colors, threshold, isOpen, onClose, onShowToast }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState('css');

  const copyToClipboard = async (text: string, type: string = 'contenido') => {
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.(`${type} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      onShowToast?.('Error al copiar al portapapeles');
    }
  };

  const generateCSS = () => {
    let css = `/* Paleta de Colores - ${threshold.toUpperCase()} */\n`;
    css += `/* Generado con ColorCheck */\n\n`;
    
    colors.forEach((color, index) => {
      css += `--color-${index + 1}: ${color};\n`;
    });
    
    css += `\n/* Combinaciones Accesibles */\n`;
    pairs.forEach((pair, index) => {
      css += `.accessible-${index + 1} {\n`;
      css += `  color: ${pair.fg};\n`;
      css += `  background-color: ${pair.bg};\n`;
      css += `  /* Contraste: ${pair.ratio}:1 */\n`;
      css += `}\n\n`;
    });
    
    return css;
  };

  const generateSCSS = () => {
    let scss = `// Paleta de Colores - ${threshold.toUpperCase()}\n`;
    scss += `// Generado con ColorCheck\n\n`;
    
    colors.forEach((color, index) => {
      scss += `$color-${index + 1}: ${color};\n`;
    });
    
    scss += `\n// Combinaciones Accesibles\n`;
    pairs.forEach((pair, index) => {
      scss += `.accessible-${index + 1} {\n`;
      scss += `  color: ${pair.fg};\n`;
      scss += `  background-color: ${pair.bg};\n`;
      scss += `  // Contraste: ${pair.ratio}:1\n`;
      scss += `}\n\n`;
    });
    
    return scss;
  };

  const generateTailwind = () => {
    let tailwind = `/* Paleta de Colores - ${threshold.toUpperCase()} */\n`;
    tailwind += `/* Generado con ColorCheck */\n\n`;
    
    colors.forEach((color, index) => {
      tailwind += `--color-${index + 1}: ${color};\n`;
    });
    
    tailwind += `\n/* Combinaciones Accesibles */\n`;
    pairs.forEach((pair, index) => {
      tailwind += `.accessible-${index + 1} {\n`;
      tailwind += `  @apply text-[${pair.fg}] bg-[${pair.bg}];\n`;
      tailwind += `  /* Contraste: ${pair.ratio}:1 */\n`;
      tailwind += `}\n\n`;
    });
    
    return tailwind;
  };

  const generateJSON = () => {
    const data = {
      palette: {
        colors: colors,
        threshold: threshold,
        generated: new Date().toISOString()
      },
      combinations: pairs.map((pair, index) => ({
        id: index + 1,
        foreground: pair.fg,
        background: pair.bg,
        contrast: pair.ratio,
        passes: pair.passes
      }))
    };
    
    return JSON.stringify(data, null, 2);
  };

  const generateFigmaMarkdown = () => {
    let markdown = `# Paleta de Colores - ${threshold.toUpperCase()}\n\n`;
    markdown += `**Generado con ColorCheck** - ${new Date().toLocaleDateString()}\n\n`;
    
    markdown += `## Colores de la Paleta\n\n`;
    colors.forEach((color, index) => {
      markdown += `### Color ${index + 1}\n`;
      markdown += `- **HEX:** \`${color}\`\n`;
      markdown += `- **RGB:** ${hexToRgb(color)}\n`;
      markdown += `- **Uso:** Color principal ${index + 1}\n\n`;
    });
    
    markdown += `## Combinaciones Accesibles\n\n`;
    markdown += `| Combinación | Fondo | Texto | Contraste | Estándares |\n`;
    markdown += `|-------------|-------|-------|-----------|------------|\n`;
    
    pairs.forEach((pair, index) => {
      markdown += `| ${index + 1} | \`${pair.bg}\` | \`${pair.fg}\` | ${pair.ratio}:1 | ${pair.passes.join(', ')} |\n`;
    });
    
    markdown += `\n## Variables CSS\n\n`;
    markdown += `\`\`\`css\n`;
    colors.forEach((color, index) => {
      markdown += `--color-${index + 1}: ${color};\n`;
    });
    markdown += `\`\`\`\n`;
    
    return markdown;
  };

  const generateFigmaJSON = () => {
    const figmaVariables = {
      "color": {
        "palette": colors.map((color, index) => ({
          name: `Color ${index + 1}`,
          value: color,
          type: "COLOR"
        })),
        "combinations": pairs.map((pair, index) => ({
          name: `Combinación ${index + 1}`,
          foreground: pair.fg,
          background: pair.bg,
          contrast: pair.ratio,
          passes: pair.passes
        }))
      }
    };
    
    return JSON.stringify(figmaVariables, null, 2);
  };

  const generateAnalysisReport = () => {
    let report = `# Reporte de Análisis de Paleta\n\n`;
    report += `**Generado con ColorCheck** - ${new Date().toLocaleDateString()}\n\n`;
    
    report += `## Información General\n`;
    report += `- **Estándar WCAG**: ${threshold.toUpperCase()}\n`;
    report += `- **Total de colores**: ${colors.length}\n`;
    report += `- **Combinaciones analizadas**: ${colors.length * (colors.length - 1)}\n`;
    report += `- **Combinaciones accesibles**: ${pairs.length}\n`;
    report += `- **Porcentaje de accesibilidad**: ${((pairs.length / (colors.length * (colors.length - 1))) * 100).toFixed(1)}%\n\n`;
    
    report += `## Paleta de Colores\n\n`;
    colors.forEach((color, index) => {
      report += `${index + 1}. **${color}**\n`;
    });
    
    report += `\n## Combinaciones Accesibles\n\n`;
    if (pairs.length === 0) {
      report += `No se encontraron combinaciones accesibles con el estándar ${threshold.toUpperCase()}.\n`;
    } else {
      report += `| Texto | Fondo | Contraste | Estándares |\n`;
      report += `|-------|-------|-----------|------------|\n`;
      pairs.forEach((pair) => {
        report += `| ${pair.fg} | ${pair.bg} | ${pair.ratio}:1 | ${pair.passes.join(', ')} |\n`;
      });
    }
    
    report += `\n## Recomendaciones\n\n`;
    if (pairs.length === 0) {
      report += `- Considera ajustar los colores para mejorar el contraste\n`;
      report += `- Revisa si necesitas colores más claros u oscuros\n`;
      report += `- Verifica que los colores cumplan con los estándares WCAG\n`;
    } else if (pairs.length < colors.length * 2) {
      report += `- La paleta tiene buena accesibilidad pero podría mejorarse\n`;
      report += `- Considera agregar variaciones de los colores existentes\n`;
    } else {
      report += `- ¡Excelente! Tu paleta tiene muy buena accesibilidad\n`;
      report += `- Puedes usar estas combinaciones con confianza\n`;
    }
    
    return report;
  };

  const generateDetailedPalette = () => {
    let detailed = `# Información Detallada de la Paleta\n\n`;
    detailed += `**Generado con ColorCheck** - ${new Date().toLocaleDateString()}\n\n`;
    
    detailed += `## Metadatos\n`;
    detailed += `- **Nombre**: Paleta Personalizada\n`;
    detailed += `- **Fecha de creación**: ${new Date().toLocaleDateString()}\n`;
    detailed += `- **Estándar WCAG**: ${threshold.toUpperCase()}\n`;
    detailed += `- **Total de colores**: ${colors.length}\n\n`;
    
    detailed += `## Colores Detallados\n\n`;
    colors.forEach((color, index) => {
      // Convertir HEX a RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      detailed += `### Color ${index + 1}\n`;
      detailed += `- **HEX**: ${color}\n`;
      detailed += `- **RGB**: rgb(${r}, ${g}, ${b})\n`;
      detailed += `- **HSL**: ${hexToHsl(color)}\n`;
      detailed += `- **Uso recomendado**: Color principal ${index + 1}\n\n`;
    });
    
    detailed += `## Análisis de Contraste\n\n`;
    detailed += `### Resumen\n`;
    detailed += `- **Combinaciones totales**: ${colors.length * (colors.length - 1)}\n`;
    detailed += `- **Combinaciones accesibles**: ${pairs.length}\n`;
    detailed += `- **Tasa de éxito**: ${((pairs.length / (colors.length * (colors.length - 1))) * 100).toFixed(1)}%\n\n`;
    
    if (pairs.length > 0) {
      detailed += `### Mejores Combinaciones\n`;
      pairs.slice(0, 5).forEach((pair, index) => {
        detailed += `${index + 1}. **${pair.fg}** sobre **${pair.bg}** (${pair.ratio}:1)\n`;
      });
    }
    
    detailed += `\n## Recomendaciones de Uso\n\n`;
    detailed += `### Para Diseño Web\n`;
    detailed += `- Usa las combinaciones verificadas para texto y fondos\n`;
    detailed += `- Mantén el contraste mínimo según WCAG ${threshold.toUpperCase()}\n`;
    detailed += `- Considera el contexto de uso (texto pequeño vs grande)\n\n`;
    
    detailed += `### Para Branding\n`;
    detailed += `- Esta paleta cumple con estándares de accesibilidad\n`;
    detailed += `- Úsala como base para tu identidad visual\n`;
    detailed += `- Considera crear variaciones para diferentes contextos\n`;
    
    return detailed;
  };

  // Función auxiliar para convertir HEX a HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const tabs = [
    { 
      id: 'css', 
      label: 'CSS', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'scss', 
      label: 'SCSS', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'tailwind', 
      label: 'Tailwind', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'json', 
      label: 'JSON', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'figma-md', 
      label: 'Figma MD', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'figma-json', 
      label: 'Figma JSON', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'analysis-report', 
      label: 'Reporte de Análisis', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'detailed-palette', 
      label: 'Paleta Detallada', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    }
  ];

  const getContent = () => {
    switch (activeTab) {
      case 'css': return generateCSS();
      case 'scss': return generateSCSS();
      case 'tailwind': return generateTailwind();
      case 'json': return generateJSON();
      case 'figma-md': return generateFigmaMarkdown();
      case 'figma-json': return generateFigmaJSON();
      case 'analysis-report': return generateAnalysisReport();
      case 'detailed-palette': return generateDetailedPalette();
      default: return generateCSS();
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'css': return 'CSS';
      case 'scss': return 'SCSS';
      case 'tailwind': return 'Tailwind CSS';
      case 'json': return 'JSON';
      case 'figma-md': return 'Figma Markdown';
      case 'figma-json': return 'Figma JSON';
      case 'analysis-report': return 'Reporte de Análisis';
      case 'detailed-palette': return 'Paleta Detallada';
      default: return 'contenido';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Resultados
        </div>
      } 
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted-foreground)]">
            {pairs.length} combinaciones accesibles encontradas con estándar {threshold.toUpperCase()}
          </div>
          <button
            onClick={() => copyToClipboard(getContent(), getTabLabel())}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors text-sm font-medium"
          >
            Copiar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-4 max-h-[60vh] overflow-y-auto">
          <pre className="text-sm text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap font-mono">
            {getContent()}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
"use client";
import { useState } from "react";

interface ColorPair {
  fg: string;
  bg: string;
  ratio: number;
  passes: string[];
}

interface FigmaExportProps {
  pairs: ColorPair[];
  colors: string[];
  threshold: string;
}

export default function FigmaExport({ pairs, colors, threshold }: FigmaExportProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [projectName, setProjectName] = useState("Mi Proyecto");
  const [projectDescription, setProjectDescription] = useState("Paleta de colores profesional con análisis de accesibilidad");

  function generateFigmaPalette() {
    const colorSwatches = colors.map((color, index) => {
      const rgb = hexToRgb(color);
      return {
        name: `Color ${index + 1}`,
        hex: color,
        rgb: rgb,
        usage: getColorUsage(color, colors)
      };
    });

    const accessibleCombinations = pairs.slice(0, 8).map((pair, index) => ({
      id: index + 1,
      foreground: pair.fg,
      background: pair.bg,
      contrastRatio: pair.ratio,
      standards: pair.passes,
      css: `color: ${pair.fg}; background-color: ${pair.bg};`
    }));

    return {
      project: {
        name: projectName,
        description: projectDescription,
        generated: new Date().toISOString(),
        wcagStandard: threshold.toUpperCase()
      },
      colorPalette: colorSwatches,
      accessibleCombinations: accessibleCombinations,
      recommendations: generateRecommendations(pairs, colors)
    };
  }

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  function getColorUsage(color: string) {
    const rgb = hexToRgb(color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    if (brightness < 50) return "Texto principal, elementos oscuros";
    if (brightness > 200) return "Fondos claros, texto secundario";
    if (brightness > 100) return "Fondos neutros, elementos secundarios";
    return "Elementos de acento, bordes";
  }

  function generateRecommendations(pairs: ColorPair[], colors: string[]) {
    const recommendations = [];
    
    const bestContrast = pairs.reduce((best, current) => 
      current.ratio > best.ratio ? current : best
    );
    
    const worstContrast = pairs.reduce((worst, current) => 
      current.ratio < worst.ratio ? current : worst
    );

    recommendations.push({
      type: "best_combination",
      title: "Mejor Combinación",
      description: `Usa ${bestContrast.fg} sobre ${bestContrast.bg} para máxima legibilidad`,
      contrast: bestContrast.ratio,
      css: `color: ${bestContrast.fg}; background-color: ${bestContrast.bg};`
    });

    if (worstContrast.ratio < 4.5) {
      recommendations.push({
        type: "warning",
        title: "Combinación Problemática",
        description: `Evita usar ${worstContrast.fg} sobre ${worstContrast.bg} - contraste insuficiente`,
        contrast: worstContrast.ratio,
        css: `color: ${worstContrast.fg}; background-color: ${worstContrast.bg};`
      });
    }

    const darkColors = colors.filter(color => {
      const rgb = hexToRgb(color);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness < 100;
    });

    const lightColors = colors.filter(color => {
      const rgb = hexToRgb(color);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 150;
    });

    if (darkColors.length > 0 && lightColors.length > 0) {
      recommendations.push({
        type: "tip",
        title: "Tip de Diseño",
        description: `Tu paleta tiene ${darkColors.length} color(es) oscuro(s) y ${lightColors.length} color(es) claro(s). Perfecto para crear jerarquía visual.`,
        colors: { dark: darkColors, light: lightColors }
      });
    }

    return recommendations;
  }

  function generateFigmaText() {
    const data = generateFigmaPalette();
    
    return `# Paleta de Colores - ${data.project.name}

## Descripción del Proyecto
${data.project.description}

**Estándar WCAG:** ${data.project.wcagStandard}  
**Generado:** ${new Date().toLocaleDateString('es-ES')}

---

## 🎨 Paleta de Colores

${data.colorPalette.map(color => 
  `### ${color.name}
- **HEX:** \`${color.hex}\`
- **RGB:** \`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})\`
- **Uso recomendado:** ${color.usage}

![Color ${color.name}](${color.hex})
`).join('\n')}

---

## ✅ Combinaciones Accesibles

${data.accessibleCombinations.map(combo => 
  `### Combo ${combo.id}: ${combo.foreground} sobre ${combo.background}
- **Ratio de contraste:** ${combo.contrastRatio}:1
- **Estándares cumplidos:** ${combo.standards.join(', ')}
- **CSS:** \`${combo.css}\`

**Vista previa:** Texto de ejemplo con esta combinación
`).join('\n')}

---

## 💡 Recomendaciones

${data.recommendations.map(rec => 
  `### ${rec.title}
${rec.description}

${rec.css ? `**CSS:** \`${rec.css}\`` : ''}
${rec.contrast ? `**Contraste:** ${rec.contrast}:1` : ''}
`).join('\n')}

---

## 📋 Para Figma

### Variables de Color
\`\`\`css
/* Variables CSS para Figma */
:root {
${data.colorPalette.map((color, index) => 
  `  --color-${index + 1}: ${color.hex}; /* ${color.name} */`
).join('\n')}
}
\`\`\`

### Estilos de Texto Recomendados
\`\`\`css
/* Texto Principal */
.text-primary {
  color: var(--color-1);
  background-color: var(--color-2);
}

/* Texto Secundario */
.text-secondary {
  color: var(--color-3);
  background-color: var(--color-4);
}
\`\`\`

---
*Generado con ColorCheck - Herramienta de análisis de accesibilidad de colores*`;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generateFigmaText());
  }

  function downloadFigmaFile() {
    const content = generateFigmaText();
    const filename = `paleta-${projectName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (pairs.length === 0) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-expanded={showPanel}
        aria-controls="figma-panel"
      >
        🎨 Exportar para Figma
      </button>

      {showPanel && (
        <div 
          id="figma-panel"
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
          role="region"
          aria-label="Panel de exportación para Figma"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Configuración del Proyecto</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Mi Proyecto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción del Proyecto
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none h-20"
                  placeholder="Descripción de tu proyecto..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Vista Previa del Documento</h4>
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                {generateFigmaText().substring(0, 500)}...
              </pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              aria-label="Copiar documento completo al portapapeles"
            >
              📋 Copiar Documento
            </button>
            <button
              onClick={downloadFigmaFile}
              className="flex-1 py-2 px-4 rounded-lg bg-pink-600 text-white hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
              aria-label="Descargar archivo Markdown para Figma"
            >
              📄 Descargar MD
            </button>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Este documento incluye toda la información necesaria para implementar tu paleta en Figma, incluyendo variables CSS, combinaciones accesibles y recomendaciones de uso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

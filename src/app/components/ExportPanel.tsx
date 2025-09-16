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
}

export default function ExportPanel({ pairs, colors, threshold, isOpen, onClose }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState('css');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
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

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const tabs = [
    { id: 'css', label: 'CSS', icon: '🎨' },
    { id: 'scss', label: 'SCSS', icon: '💎' },
    { id: 'tailwind', label: 'Tailwind', icon: '⚡' },
    { id: 'json', label: 'JSON', icon: '📄' },
    { id: 'figma-md', label: 'Figma MD', icon: '🎯' },
    { id: 'figma-json', label: 'Figma JSON', icon: '🔧' }
  ];

  const getContent = () => {
    switch (activeTab) {
      case 'css': return generateCSS();
      case 'scss': return generateSCSS();
      case 'tailwind': return generateTailwind();
      case 'json': return generateJSON();
      case 'figma-md': return generateFigmaMarkdown();
      case 'figma-json': return generateFigmaJSON();
      default: return generateCSS();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📤 Exportar Resultados" size="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted-foreground)]">
            {pairs.length} combinaciones accesibles encontradas con estándar {threshold.toUpperCase()}
          </div>
          <button
            onClick={() => copyToClipboard(getContent())}
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
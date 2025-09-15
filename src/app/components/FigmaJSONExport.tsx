"use client";
import { useState } from "react";

interface ColorPair {
  fg: string;
  bg: string;
  ratio: number;
  passes: string[];
}

interface FigmaJSONExportProps {
  pairs: ColorPair[];
  colors: string[];
  threshold: string;
}

export default function FigmaJSONExport({ pairs, colors, threshold }: FigmaJSONExportProps) {
  const [showPanel, setShowPanel] = useState(false);

  function generateFigmaJSON() {
    const colorVariables = colors.map((color, index) => {
      const rgb = hexToRgb(color);
      return {
        name: `color-${index + 1}`,
        description: `Color ${index + 1} de la paleta`,
        type: "COLOR",
        valuesByMode: {
          "1": {
            r: rgb.r / 255,
            g: rgb.g / 255,
            b: rgb.b / 255,
            a: 1
          }
        },
        resolvedType: "COLOR",
        hiddenFromPublishing: false,
        scopes: ["ALL_FILLS", "ALL_STROKES"],
        codeSyntax: {
          WEB: `var(--color-${index + 1})`
        }
      };
    });

    const textStyles = pairs.slice(0, 6).map((pair, index) => ({
      name: `text-style-${index + 1}`,
      description: `Estilo de texto con contraste ${pair.ratio}:1`,
      type: "TEXT",
      valuesByMode: {
        "1": {
          fontFamily: "Inter",
          fontPostScriptName: "Inter-Regular",
          paragraphSpacing: 0,
          paragraphIndent: 0,
          listSpacing: 0,
          hangingPunctuation: false,
          hangingList: false,
          fontSize: 16,
          textDecoration: "NONE",
          textCase: "ORIGINAL",
          lineHeight: {
            unit: "AUTO"
          },
          letterSpacing: {
            unit: "PIXELS",
            value: 0
          },
          fills: [
            {
              type: "SOLID",
              color: {
                r: hexToRgb(pair.fg).r / 255,
                g: hexToRgb(pair.fg).g / 255,
                b: hexToRgb(pair.fg).b / 255,
                a: 1
              }
            }
          ],
          fillStyleId: `color-${colors.indexOf(pair.fg) + 1}`,
          backgroundStyleId: `color-${colors.indexOf(pair.bg) + 1}`,
          effects: []
        }
      },
      resolvedType: "TEXT",
      hiddenFromPublishing: false,
      scopes: ["ALL_TEXT"]
    }));

    return {
      version: "1.0",
      generated: new Date().toISOString(),
      project: {
        name: "ColorCheck Palette",
        description: `Paleta de colores con análisis WCAG ${threshold.toUpperCase()}`,
        colors: colors.length,
        accessibleCombinations: pairs.length
      },
      variables: colorVariables,
      textStyles: textStyles,
      metadata: {
        wcagStandard: threshold,
        bestContrast: Math.max(...pairs.map(p => p.ratio)),
        worstContrast: Math.min(...pairs.map(p => p.ratio)),
        averageContrast: pairs.reduce((sum, p) => sum + p.ratio, 0) / pairs.length
      }
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

  function copyJSONToClipboard() {
    const jsonData = generateFigmaJSON();
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
  }

  function downloadJSONFile() {
    const jsonData = generateFigmaJSON();
    const filename = `figma-palette-${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
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
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-expanded={showPanel}
        aria-controls="figma-json-panel"
      >
        🔧 JSON para Figma
      </button>

      {showPanel && (
        <div 
          id="figma-json-panel"
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
          role="region"
          aria-label="Panel de exportación JSON para Figma"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">JSON para Figma Variables</h3>
            <p className="text-sm text-slate-600">
              Este JSON contiene las variables de color y estilos de texto que puedes importar directamente en Figma.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800">Variables de Color</div>
                <div className="text-blue-600">{colors.length} colores</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800">Estilos de Texto</div>
                <div className="text-green-600">{Math.min(6, pairs.length)} estilos</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Vista Previa del JSON</h4>
            <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-auto">
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(generateFigmaJSON(), null, 2).substring(0, 800)}...
              </pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={copyJSONToClipboard}
              className="flex-1 py-2 px-4 rounded-lg bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              aria-label="Copiar JSON al portapapeles"
            >
              📋 Copiar JSON
            </button>
            <button
              onClick={downloadJSONFile}
              className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              aria-label="Descargar archivo JSON"
            >
              📄 Descargar JSON
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700">
              💡 <strong>Instrucciones:</strong> Copia el JSON y pégalo en Figma usando el plugin "Variables" o importa el archivo directamente en tu proyecto de Figma.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

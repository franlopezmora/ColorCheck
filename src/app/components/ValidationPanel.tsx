"use client";
import { validatePalette, getContrastLevel } from "./ColorValidator";

interface ValidationPanelProps {
  colors: string[];
  pairs?: Array<{ fg: string; bg: string; ratio: number; passes: string[] }>;
}

export default function ValidationPanel({ colors, pairs = [] }: ValidationPanelProps) {
  const validation = validatePalette(colors);

  if (validation.isValid && validation.warnings.length === 0 && validation.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div 
          className="p-4 rounded-xl bg-red-50 border-2 border-red-200"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-2">
            <span className="text-red-500 text-lg" aria-hidden="true">❌</span>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-800">Errores de Validación</h4>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500 text-lg" aria-hidden="true">⚠️</span>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-800">Advertencias</h4>
              <ul className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-lg" aria-hidden="true">💡</span>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Sugerencias</h4>
              <ul className="space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {pairs.length > 0 && (
        <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 text-lg" aria-hidden="true">📊</span>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">Resumen del Análisis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Total de combinaciones:</span>
                  <span className="ml-2 text-green-800 font-bold">{pairs.length}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Mejor contraste:</span>
                  <span className="ml-2 text-green-800 font-bold">
                    {Math.max(...pairs.map(p => p.ratio)).toFixed(1)}:1
                  </span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Peor contraste:</span>
                  <span className="ml-2 text-green-800 font-bold">
                    {Math.min(...pairs.map(p => p.ratio)).toFixed(1)}:1
                  </span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Promedio:</span>
                  <span className="ml-2 text-green-800 font-bold">
                    {(pairs.reduce((sum, p) => sum + p.ratio, 0) / pairs.length).toFixed(1)}:1
                  </span>
                </div>
              </div>
              
              {/* Contrast Distribution */}
              <div className="mt-3">
                <h5 className="text-sm font-medium text-green-700 mb-2">Distribución de Contraste</h5>
                <div className="space-y-1">
                  {[
                    { min: 7, label: "Excelente (7:1+)" },
                    { min: 4.5, max: 7, label: "Bueno (4.5:1 - 7:1)" },
                    { min: 3, max: 4.5, label: "Aceptable (3:1 - 4.5:1)" },
                    { min: 0, max: 3, label: "Pobre (<3:1)" }
                  ].map((range, index) => {
                    const count = pairs.filter(p => {
                      if (range.max) {
                        return p.ratio >= range.min && p.ratio < range.max;
                      }
                      return p.ratio >= range.min;
                    }).length;
                    
                    const percentage = pairs.length > 0 ? (count / pairs.length) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-green-700">{range.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-green-800 font-medium w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

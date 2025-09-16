'use client';

import { useState } from 'react';

interface ColorPair {
  fg: string;
  bg: string;
  ratio: number;
  passes: string[];
}

interface AnalysisPanelProps {
  colors: string[];
  pairs: ColorPair[];
  threshold: string;
}

export default function AnalysisPanel({ colors, pairs, threshold }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const getAnalysisSummary = () => {
    const totalCombinations = colors.length * colors.length;
    const accessibleCombinations = pairs.length;
    const accessibilityRate = totalCombinations > 0 ? (accessibleCombinations / totalCombinations * 100).toFixed(1) : '0';
    
    return {
      totalColors: colors.length,
      totalCombinations,
      accessibleCombinations,
      accessibilityRate,
      threshold
    };
  };

  const getWarnings = () => {
    const warnings = [];
    
    if (colors.length < 2) {
      warnings.push({
        type: 'error',
        title: 'Paleta Insuficiente',
        message: 'Necesitas al menos 2 colores para generar combinaciones accesibles.',
        action: 'Agregar más colores'
      });
    }
    
    if (colors.length > 8) {
      warnings.push({
        type: 'warning',
        title: 'Demasiados Colores',
        message: 'Con más de 8 colores es difícil mantener consistencia visual.',
        action: 'Considerar reducir la paleta'
      });
    }
    
    const lowContrastColors = colors.filter(color => {
      // Simular detección de colores con bajo contraste
      return ['#000000', '#333333', '#666666', '#999999'].includes(color.toLowerCase());
    });
    
    if (lowContrastColors.length > 0) {
      warnings.push({
        type: 'warning',
        title: 'Colores Problemáticos',
        message: `${lowContrastColors.length} color(es) pueden tener problemas de contraste.`,
        action: 'Revisar contraste'
      });
    }
    
    return warnings;
  };

  const getSuggestions = () => {
    const suggestions = [];
    const summary = getAnalysisSummary();
    
    if (parseFloat(summary.accessibilityRate) < 50) {
      suggestions.push({
        type: 'improvement',
        title: 'Mejorar Accesibilidad',
        message: `Solo ${summary.accessibilityRate}% de las combinaciones son accesibles. Considera ajustar los colores.`,
        action: 'Optimizar paleta'
      });
    }
    
    if (colors.length >= 3 && colors.length <= 5) {
      suggestions.push({
        type: 'success',
        title: 'Paleta Bien Balanceada',
        message: 'Tu paleta tiene una cantidad ideal de colores para mantener consistencia.',
        action: 'Mantener estructura'
      });
    }
    
    if (pairs.length > 10) {
      suggestions.push({
        type: 'success',
        title: 'Excelente Accesibilidad',
        message: `¡Excelente! Tienes ${pairs.length} combinaciones accesibles.`,
        action: 'Continuar así'
      });
    }
    
    // Sugerencias por tipo de paleta
    const hasWarmColors = colors.some(color => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return r > g && r > b; // Más rojo que otros colores
    });
    
    if (hasWarmColors) {
      suggestions.push({
        type: 'info',
        title: 'Paleta Cálida Detectada',
        message: 'Tu paleta tiene tonos cálidos. Perfecta para crear ambientes acogedores.',
        action: 'Aprovechar calidez'
      });
    }
    
    return suggestions;
  };

  const getColorAnalysis = () => {
    const analysis = {
      totalColors: colors.length,
      colorTypes: {
        dark: colors.filter(color => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness < 128;
        }).length,
        light: colors.filter(color => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness >= 128;
        }).length
      },
      accessibility: {
        excellent: pairs.filter(pair => pair.ratio >= 7).length,
        good: pairs.filter(pair => pair.ratio >= 4.5 && pair.ratio < 7).length,
        acceptable: pairs.filter(pair => pair.ratio >= 3 && pair.ratio < 4.5).length
      }
    };
    
    return analysis;
  };

  const summary = getAnalysisSummary();
  const warnings = getWarnings();
  const suggestions = getSuggestions();
  const analysis = getColorAnalysis();

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: '📊' },
    { id: 'warnings', label: 'Advertencias', icon: '⚠️', count: warnings.length },
    { id: 'suggestions', label: 'Sugerencias', icon: '💡', count: suggestions.length },
    { id: 'analysis', label: 'Análisis', icon: '🔍' }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">{summary.totalColors}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Colores en la paleta</div>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">{summary.accessibleCombinations}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Combinaciones accesibles</div>
              </div>
            </div>
            <div className="bg-[var(--secondary)] rounded-lg p-4">
              <div className="text-2xl font-bold text-[var(--foreground)]">{summary.accessibilityRate}%</div>
              <div className="text-sm text-[var(--muted-foreground)]">Tasa de accesibilidad</div>
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              Estándar WCAG: <span className="font-medium text-[var(--foreground)]">{threshold.toUpperCase()}</span>
            </div>
          </div>
        );

      case 'warnings':
        return (
          <div className="space-y-3">
            {warnings.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <div className="text-4xl mb-2">✅</div>
                <p>No hay advertencias</p>
              </div>
            ) : (
              warnings.map((warning, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  warning.type === 'error' 
                    ? 'border-red-500/30 bg-red-500/10' 
                    : 'border-yellow-500/30 bg-yellow-500/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {warning.type === 'error' ? '🚨' : '⚠️'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--foreground)]">{warning.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{warning.message}</p>
                      <button className="text-sm text-[var(--primary)] mt-2 hover:underline">
                        {warning.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                suggestion.type === 'success' 
                  ? 'border-green-500/30 bg-green-500/10'
                  : suggestion.type === 'improvement'
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-gray-500/30 bg-gray-500/10'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {suggestion.type === 'success' ? '✅' : 
                     suggestion.type === 'improvement' ? '💡' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--foreground)]">{suggestion.title}</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{suggestion.message}</p>
                    <button className="text-sm text-[var(--primary)] mt-2 hover:underline">
                      {suggestion.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <div className="text-lg font-bold text-[var(--foreground)]">{analysis.colorTypes.dark}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Colores oscuros</div>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <div className="text-lg font-bold text-[var(--foreground)]">{analysis.colorTypes.light}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Colores claros</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">Excelente (7:1+)</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{analysis.accessibility.excellent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">Bueno (4.5:1-7:1)</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{analysis.accessibility.good}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">Aceptable (3:1-4.5:1)</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{analysis.accessibility.acceptable}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
          📈 Análisis de Paleta
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
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
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {getTabContent()}
      </div>
    </div>
  );
}

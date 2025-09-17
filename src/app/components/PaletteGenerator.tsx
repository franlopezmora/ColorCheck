'use client';

import { useState } from 'react';

interface PaletteGeneratorProps {
  onPaletteGenerated: (colors: string[]) => void;
}

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

export default function PaletteGenerator({ onPaletteGenerated }: PaletteGeneratorProps) {
  const [baseColor, setBaseColor] = useState('#db89e2');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [isGenerating, setIsGenerating] = useState(false);

  // Convertir hex a HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

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

    return [h * 360, s * 100, l * 100];
  };

  // Convertir HSL a hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Generar colores armónicos
  const generateHarmonicColors = (baseHsl: [number, number, number], type: HarmonyType): string[] => {
    const [h, s, l] = baseHsl;
    const colors: string[] = [hslToHex(h, s, l)]; // Color base

    switch (type) {
      case 'complementary':
        colors.push(hslToHex((h + 180) % 360, s, l));
        colors.push(hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 20)));
        colors.push(hslToHex(h, Math.max(0, s - 40), Math.min(100, l - 20)));
        colors.push(hslToHex((h + 180) % 360, Math.max(0, s - 20), Math.min(100, l + 20)));
        break;

      case 'analogous':
        colors.push(hslToHex((h + 30) % 360, s, l));
        colors.push(hslToHex((h - 30 + 360) % 360, s, l));
        colors.push(hslToHex((h + 60) % 360, s, l));
        colors.push(hslToHex((h - 60 + 360) % 360, s, l));
        break;

      case 'triadic':
        colors.push(hslToHex((h + 120) % 360, s, l));
        colors.push(hslToHex((h + 240) % 360, s, l));
        colors.push(hslToHex(h, Math.max(0, s - 30), Math.min(100, l + 30)));
        colors.push(hslToHex((h + 120) % 360, Math.max(0, s - 30), Math.min(100, l - 30)));
        break;

      case 'tetradic':
        colors.push(hslToHex((h + 90) % 360, s, l));
        colors.push(hslToHex((h + 180) % 360, s, l));
        colors.push(hslToHex((h + 270) % 360, s, l));
        colors.push(hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 20)));
        break;

      case 'monochromatic':
        colors.push(hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 20)));
        colors.push(hslToHex(h, Math.max(0, s - 40), Math.min(100, l - 20)));
        colors.push(hslToHex(h, Math.max(0, s - 10), Math.min(100, l + 40)));
        colors.push(hslToHex(h, Math.max(0, s - 30), Math.min(100, l - 40)));
        break;
    }

    return colors;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const baseHsl = hexToHsl(baseColor);
      const generatedColors = generateHarmonicColors(baseHsl, harmonyType);
      
      // Simular un pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onPaletteGenerated(generatedColors);
    } catch (error) {
      console.error('Error generando paleta:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const harmonyOptions = [
    { value: 'complementary', label: 'Complementario', description: 'Colores opuestos' },
    { value: 'analogous', label: 'Análogo', description: 'Colores adyacentes' },
    { value: 'triadic', label: 'Triádico', description: 'Separados 120°' },
    { value: 'tetradic', label: 'Tetrádico', description: 'Separados 90°' },
    { value: 'monochromatic', label: 'Monocromático', description: 'Mismo tono' }
  ];

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎨</span>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Generador de Paleta
        </h3>
      </div>

      <div className="space-y-4">
        {/* Color Base Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Color Base
          </label>
          <div className="flex gap-2">
            <div className="relative w-12 h-12 flex-shrink-0">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-full rounded-lg border-2 border-[var(--border)] cursor-pointer"
                style={{ 
                  backgroundColor: baseColor,
                  borderRadius: '8px',
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                  maxWidth: '48px',
                  maxHeight: '48px'
                }}
              />
            </div>
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="flex-1 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs"
              placeholder="#db89e2"
            />
          </div>
        </div>

        {/* Harmony Type Selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Tipo de Armonía
          </label>
          <div className="grid grid-cols-1 gap-2">
            {harmonyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setHarmonyType(option.value as HarmonyType)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  harmonyType === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generando...
            </div>
          ) : (
            'Generar Paleta'
          )}
        </button>

        <div className="text-xs text-[var(--muted-foreground)] text-center">
          Genera una paleta armónica basada en tu color base
        </div>
      </div>
    </div>
  );
}

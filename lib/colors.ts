export type RGB = { r: number; g: number; b: number };
export type ParsedColor = {
  input: string; hex: string; rgb: [number, number, number]; luminance: number
};

const HEX_SHORT = /^#([0-9a-fA-F]{3})$/;
const HEX_LONG  = /^#([0-9a-fA-F]{6})$/;

export function normalizeHex(hex: string): string {
  if (HEX_SHORT.test(hex)) {
    const m = hex.match(HEX_SHORT)![1];
    return "#" + m.split("").map((c) => c + c).join("").toUpperCase();
  }
  if (HEX_LONG.test(hex)) return hex.toUpperCase();
  throw new Error(`Color inválido: ${hex}`);
}

export function hexToRgb(hex: string): RGB {
  const n = normalizeHex(hex).slice(1);
  return { r: parseInt(n.slice(0,2),16), g: parseInt(n.slice(2,4),16), b: parseInt(n.slice(4,6),16) };
}

export function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RGB): number {
  const r = srgbToLinear(rgb.r), g = srgbToLinear(rgb.g), b = srgbToLinear(rgb.b);
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

export function parseColor(input: string): ParsedColor {
  const hex = normalizeHex(input);
  const rgb = hexToRgb(hex);
  const lum = relativeLuminance(rgb);
  return { input, hex, rgb: [rgb.r, rgb.g, rgb.b], luminance: +lum.toFixed(6) };
}

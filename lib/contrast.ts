import type { ParsedColor } from "./colors";

export function contrastRatio(fg: ParsedColor, bg: ParsedColor): number {
  const L1 = Math.max(fg.luminance, bg.luminance);
  const L2 = Math.min(fg.luminance, bg.luminance);
  return +(((L1 + 0.05) / (L2 + 0.05)).toFixed(2));
}

export function buildContrastMatrix(colors: ParsedColor[], includeSelf = false): number[][] {
  return colors.map((c1, i) =>
    colors.map((c2, j) => (i === j && !includeSelf ? 1 : contrastRatio(c1, c2)))
  );
}

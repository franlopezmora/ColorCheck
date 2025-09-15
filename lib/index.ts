import { parseColor } from "./colors";
import { buildContrastMatrix } from "./contrast";
import { passes, thresholds, type Threshold } from "./wcag";

export function analyzePalette(palette: string[], options: { includeSelfPairs?: boolean } = {}) {
  const colors = palette.map(parseColor);
  const matrix = buildContrastMatrix(colors, options.includeSelfPairs ?? false);
  return { colors, matrix, criteria: thresholds };
}

export function accessiblePairs(palette: string[], threshold: Threshold = "aa_normal") {
  const colors = palette.map(parseColor);
  const pairs: { fg: string; bg: string; ratio: number; passes: Threshold[] }[] = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      if (i === j) continue;
      const fg = colors[i], bg = colors[j];
      const L1 = Math.max(fg.luminance, bg.luminance);
      const L2 = Math.min(fg.luminance, bg.luminance);
      const ratio = +(((L1 + 0.05) / (L2 + 0.05)).toFixed(2));
      const p = passes(ratio);
      if (p.includes(threshold)) pairs.push({ fg: fg.hex, bg: bg.hex, ratio, passes: p });
    }
  }
  pairs.sort((a, b) => b.ratio - a.ratio);
  return { pairs };
}

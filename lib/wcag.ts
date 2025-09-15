export type Threshold = "aa_normal" | "aa_large" | "aaa_normal" | "aaa_large" | "ui_graphic";

export const thresholds: Record<Threshold, number> = {
  aa_normal: 4.5,
  aa_large: 3.0,
  aaa_normal: 7.0,
  aaa_large: 4.5,
  ui_graphic: 3.0,
};

export function passes(ratio: number): Threshold[] {
  return (Object.keys(thresholds) as Threshold[]).filter(k => ratio >= thresholds[k]);
}

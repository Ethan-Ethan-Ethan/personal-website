// 時段光唯一正本：0..1 光量 → canvas brightness/saturate 濾鏡字串。
// FishLayer（魚）與 LotusLayer（荷葉）共用，參數不同是刻意的：
// 魚要夜暗晝亮對比大（0.45/0.55/0.7/0.4），葉要保實色下限高（0.6/0.4/0.85/0.3）。
// DPR_2D：2D 疊加層共用解析度上限（WebGL 主層另有 1.15/1.55，不混）。
export const DPR_CAP_2D = 1.5;

export function lightFilter(
  t: number,
  bBase: number,
  bSpan: number,
  sBase: number,
  sSpan: number,
): string {
  const c = Math.min(1, Math.max(0, t));
  return `brightness(${(bBase + bSpan * c).toFixed(2)}) saturate(${(sBase + sSpan * c).toFixed(2)})`;
}

export function fishLightFilter(t: number, glow: number = 1): string {
  const c = Math.min(1, Math.max(0, t));
  const b = (0.45 + 0.55 * c) * spotVisibility(glow);
  return `brightness(${b.toFixed(2)}) saturate(${(0.7 + 0.4 * c).toFixed(2)})`;
}

// 光斑可見度：游出光帶就暗（0.3 保底），光裡全亮。
export function spotVisibility(glow: number): number {
  const g = Math.min(1, Math.max(0, glow * 1.2));
  return 0.3 + 0.7 * Math.pow(g, 1.5);
}

export function lotusLightFilter(t: number): string {
  return lightFilter(t, 0.6, 0.4, 0.85, 0.3);
}

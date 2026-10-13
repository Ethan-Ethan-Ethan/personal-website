/**
 * recipe-runtime-binding.ts — Recipe→site-system 綁定（Task 6，deterministic 純函式）。
 * hex 唯一來源：verification/contracts/palette-hex-map.v1.yaml（canonical）；
 * 下方 HEXMAP 為其 derived 鏡像，單測斷言兩者一致（見 verification/unit/recipe-runtime-binding.test.ts）。
 * UNKNOWN/缺值一律降級靜態可讀頁（staticFallback=true＋灰階），絕不猜值。
 * 本 Task 不改 components/CSS/Three.js（out_of_scope，網站 runtime 另案消費）。
 */

export const GRAY = "#6b7280";

// Derived from palette-hex-map.v1.yaml (dark_cool 實證：shell.css .workspace-scene #10132a；forecast_deep：forecast 參考 fallback bg #04121b；forecast_ink：forecast 參考圖標純白，房子＋側軌共讀)
export const HEXMAP: Record<string, string> = {
  dark_cool: "#10132a",
  forecast_deep: "#04121b",
  forecast_ink: "#ffffff",
  _default: GRAY,
};

export interface RuntimeParams {
  staticFallback: boolean;
  cssVars: string[];
  hotspots: unknown[];
  animate: boolean;
}

export function bindRecipe(recipe: unknown): RuntimeParams {
  const r = recipe as {
    scene?: { id?: string };
    visual?: { palette?: string[]; hotspot?: unknown[] };
    motion?: { loop?: boolean };
  } | null;
  if (!r?.scene?.id) return { staticFallback: true, cssVars: [GRAY], hotspots: [], animate: false };
  const pal: string[] = r?.visual?.palette ?? ["UNKNOWN"];
  if (pal.includes("UNKNOWN")) return { staticFallback: true, cssVars: [GRAY], hotspots: [], animate: false };
  return {
    staticFallback: false,
    cssVars: pal.map((p) => HEXMAP[p] ?? GRAY),
    hotspots: r?.visual?.hotspot ?? [],
    animate: !!r?.motion?.loop,
  };
}

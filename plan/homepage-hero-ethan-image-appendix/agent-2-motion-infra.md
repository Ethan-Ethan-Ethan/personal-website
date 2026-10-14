# agent-2: 動效／視覺基建＋forecast-center 可行性（Wave 1 explore，唯讀）

- 庫現成：`gsap@3.15`、`@gsap/react@2.1.2`、`three@0.185`、React 19、Astro 7、Tailwind 4。
- gsap 實用 2 處：`SplitText.tsx:12-17,115`（靜態 import＋scrollTrigger 逐字，唯一 `useGSAP`）；`LakeCanvas.tsx:25-30,250`（動態 import，palette 過渡 tween）。
- three 實用 2 處：`GalaxyCanvas.tsx`（Points 星空）；`LakeCanvas.tsx:81-134`（全屏 Plane＋fbm 水波＋8 波源 ripple＋河床紋理）。
- 掛載：React island `client:load`（`index.astro:24`）→ `requestIdleCallback` 延遲 boot → 動態 import（避 SSR 炸）；生命週期完整（WebGL 檢查→reduced-motion→pixelRatio 上限→visibility 暫停→ResizeObserver→dispose）。
- 圖片：不用 `astro:assets`（零命中）；`public/assets/` 靜態直引；`lake-assets.ts` 5 行正本。
- 硬約束（fail-closed）：缺 scene.id 或 palette UNKNOWN → 灰階靜態 fallback；新 palette 須先註冊 `palette-hex-map.v1.yaml`；新 asset 層需 `assets-provenance` 四件套；visual-compositing V01–V04（禁 depthProbe／禁 #ff00ff 等）動合成改動須過 harness；three/gsap 鎖版不升級；單頁 1 個 WebGL context；wheel 劫持僅 hero 首屏＋逃生口；reduced-motion 必做。
- 複用首選 `LakeCanvas`（327 行，全套生命週期）；`SplitText`＋`LakeOverlay` 管 overlay；`lightweight-charts` 若有效果含時序圖。
- 風險：bundle 已重（three＋charts），加 drei/motion 觸 n-budget gate。

非阻塞 gaps：design-system hero-001 未細讀；lake-* core 小檔未逐行；evaluator/CAPABILITY 未讀（動工前按需補）。
subagent session ses_ed22703deffeHivyiBbQFhknYO；快取 `memory/explore/2026-10-12-personal-website-animation-visual-infra.md`。

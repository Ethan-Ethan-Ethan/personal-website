# muse 執行後審查證據包（Q2 缺口關閉，2026-10-12）

審查 verdict：`G-Issues`（Q1 兩實修＋Q2 證據缺口＋1 保留異議；本檔關 Q2，Q1 修見 commits，保留異議已補 rail 不重疊 e2e）。

## 1. 範圍取證（機器執行，主 agent）

- `git log --oneline edbfbf0~1..HEAD`＝10 commits（edbfbf0→e97480f），見上。
- `git diff --stat edbfbf0~1..HEAD`＝18 files＋694／−2；src 改動僅：LakeOverlay.tsx（9 行）、lake-assets.ts（＋6）、recipe-runtime-binding.ts（＋3 鏡像）、ForecastGlass.tsx／forecast-placeholder.ts（新）、palette yaml（＋2）、brand png（新）、brand-image.spec.ts（新）。**`src/pages/index.astro` diff 零行**（`git diff … -- src/pages/index.astro | wc -l`＝0）。
- 基線 `f73326d:src/pages/index.astro:19`＝`const USE_LAKE = true`（本次第一個 commit 之前已是 Lake 分支）。

## 2. 47 failed 定位器→來源映射（本輪 test-results 實證）

waiting-for 行 36 條，來源全部落在停用分支（WorkspaceDesktop／WorkspaceScene 子樹，LakeLanding 永不渲染）：

| 定位器 | 次數 | 唯一來源 |
|---|---|---|
| `.workspace-page` | 11 | WorkspaceDesktop.tsx:151（LakeLanding 無此 class） |
| `.workspace-scene` | 5 | WorkspaceScene.tsx:12 |
| hotspot trigger（projects／ai-lab） | 6 | ComputerHotspots.tsx（WorkspaceScene:25 掛載） |
| `.sky-aperture`（＋starfield i） | 7 | SceneAtmosphere（WorkspaceScene:13 掛載） |
| `.workspace-copy` | 2 | WorkspaceScene.tsx:20 |
| `.computer-foreground` | 2 | ForegroundOcclusion（WorkspaceScene:14 掛載） |
| `.workspace-dock`／`.workspace-brand`／`.shooting-star` | 3 | 同上子樹 |

其餘 11 條（hover/focus/tap/boundingBox/evaluate timeout、toBeGreaterThan、dialog／heading 不可見）作用對象同為上述缺失元素（ai-lab／projects／Trading Lab／About 對話框、workspace 文案），無一指向 LakeLanding 渲染元素。反向證據：本次 17 passed 含新 glass 7 斷言，island 正常 hydrate，排除整頁 crash 導致元素消失。

結論：47 failed＝pre-existing（分支停用），與本次 diff 無因果。D4 維持「另案」，但狀態由「宣稱」升級為「已證」。

## 3. 口徑註記（muse MISSING 回應）

- brand-image.spec：檔內 4 tests；desktop 跑 4、mobile 跑 3（rail 不重疊僅 desktop）→ 7 passed＋1 skipped。早前「6/6」＝當時 3 tests×2 projects，口徑一致，非造假。
- 自稱 vitest／build／validate 綠：本輪實測 vitest 21 files／161 tests EXIT 0、build 1664 pages BUILD_EXIT 0（set -o pipefail；見 plan Verification）。
- "Strom" 拼字：沿用 forecast-center 參考原文（GoodCase 明確要求保留 typo），非筆誤。

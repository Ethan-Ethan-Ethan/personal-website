# agent-1: 首頁現狀＋左上 Ethan（Wave 1 explore，唯讀）

- 首頁唯一：`src/pages/index.astro`（34 行），`USE_LAKE=true`（L19）→ 當前首頁 = LakeLanding；`WorkspaceDesktop` 分支停用（改回 false 即回滾）。
- `src/layouts/BaseLayout.astro`（47 行）純殼，無 header/nav。
- 左上 Ethan＝寫死文字：`src/features/workspace/elements/LakeOverlay.tsx:45` 純文字節點 `<a>Ethan</a>`，inline style（top:20, left:24；Georgia serif 11px `#f5f1e6`＋textShadow）。停用分支 `WorkspaceScene.tsx:16-17` 也是文字（`brand-chip`，`shell.css:4-6`，但 `display:none`）。
- `src/components/Topbar.astro:13-19` 僅 7 個非首頁用，首頁無 import——勿誤改。
- 版式：`LakeLanding.tsx`＝`fixed inset:0` 容器 → `LakeCanvas`＋`FishLayer`＋`LakeOverlay`（四角 UI，無 `<header>` 語義）。SEO 由 `index.astro:27-33` noscript `<h1>` 承擔。
- 圖片慣例：`src/assets/` 不存在；一律 `public/` 絕對路徑（lake：`public/assets/lake/koi-mix.png`、`pond-08.png`，正本 `core/lake-assets.ts:2-3`）。
- 最小觸及：僅 `LakeOverlay.tsx:45` 一行；圖片放 `public/assets/lake/`＋`lake-assets.ts` 加常數；保留 `pointerEvents:auto`；圖片需自帶對比（頂部 96px 黑漸層為文字調的）；`alt="Ethan 首頁"`；Topbar/WorkspaceScene 仍文字→換後三處品牌分叉需決策。

gap：無。subagent session ses_ed22703dfffeiY3CWLm7bYRTGP；快取 `memory/explore/2026-10-12-personal-website-homepage-ethan-brand.md`。

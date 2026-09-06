---
type: plan
status: active
project: personal-website
created: 2026-09-05
updated: 2026-09-05
tags: [project/personal-website, architecture/refactor, implementation]
source_exempt: true
---

# Site System 指令化重構實作計畫

1. 建立目標檔案快照並凍結 unit/e2e/Astro baseline。
2. 先建 `site-system` Capability Contract、frozen fixtures、rubric 與失敗測試。
3. 實作 YAML parser／validator／generator／drift check；產生 TypeScript registry。
4. 建立 runtime Command Bus，逐一遷移 scene/window commands。
5. 以 facade 保留舊 import，拆分 workspace core、elements、windows。
6. 將 append-only CSS 收斂為 tokens/shell/scene/elements/windows/responsive 六層，舊 CSS 成為 aggregator。
7. 建立 `site.mjs` router 與 system/content/rss/verify commands；舊 scripts 與 npm commands 保留 alias。
8. 移動 public projection 至 generated 目錄並同步所有 consumer、DSH 與 tests。
9. 以 TDD 修正 article slug 與 draft filtering。
10. 執行 unit、e2e、contract、DSH、content、Astro build、diff 與 Vault link/schema 驗證。
11. 派 reviewer 審查；修正 Critical/Important 後重跑全量驗證。

本輪不刪除、封存、push 或部署。

## 增補任務：透明前景景深修正（2026-09-06）

1. 先建立失敗測試：要求桌機／手機透明前景存在、具 Alpha、尺寸正確，且 CSS 不再使用 `.computer-foreground` polygon。
2. 非破壞性產出 `workspace-foreground-alpha.png` 與 `workspace-mobile-foreground-alpha.png` 候選素材。
3. 將 `ForegroundOcclusion` 改為真正透明前景層；Three.js 與星點層固定在其下方。
4. 玩偶動畫仍可使用獨立 overlay，但不能讓星星穿過玩偶本體。
5. Playwright 以 computed z-index 與實際 alpha asset 檢查桌機／手機 layer order。
6. 執行 unit、E2E、reduced-motion、WebGL fallback 與 Astro build。
7. 保留舊 WebP 與 rollback 路徑；未經確認不刪除舊素材。

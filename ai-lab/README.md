---
type: note
status: active
created: 2026-09-05
updated: 2026-10-19
tags:
  - project/personal-website
  - domain/ai-dev
source_exempt: true
---

# AI Lab

> 個人網站內的 AI Lab 模組入口。此頁只負責網站路由、公開內容映射與發布邊界；各 AI 專案仍由原專案頁擔任唯一 Canonical Source，不在這裡複製正文。

## 網站模組

- **現役首頁**：`src/features/workspace/elements/LakeLanding.tsx`（index `USE_LAKE=true`）
- **凍結**：`src/features/workspace/WorkspaceDesktop.tsx`（含 AI Lab 浮動視窗；現役湖面不掛這層）
- 公開衍生資料：`src/data/generated/public-content.json`（content:sync；湖面 overlay 幾乎不讀這份）
- 白名單設定：`config/public-content.json`
- 同步與隱私閘門：`scripts/lib/sync-public-content.mjs`
- 指令入口：`npm run site -- content <check|sync>`

## Canonical Sources

- [[04_Projects/影片轉場分析器/影片轉場分析器|影片轉場分析器]]
- [[04_Projects/自建 Harness/01-自建 Harness Dashboard|自建 Harness]]
- [[04_Projects/Graphify 知識圖譜/Graphify 知識圖譜|Graphify 知識圖譜]]
- [[04_Projects/SearXNG 整合/SearXNG 整合|SearXNG 整合]]

## 資料流

```text
各專案 canonical note
└── 經人工審核的 site_* frontmatter
    └── 個人網站 public projection
        └── WorkspaceDesktop AI Lab 窗（凍結；live 湖面不顯示）
```

## 公開邊界

- 只發布白名單內的標題、摘要、Highlights、狀態與公開連結。
- 不發布完整專案正文、Worklog、絕對路徑、憑證、localhost、runtime 或內部操作資料。
- 本資料夾是個人網站的 AI Lab 組裝層，不是 AI 專案內容的第二份正本。

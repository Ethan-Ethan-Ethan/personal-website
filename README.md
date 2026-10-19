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

# 個人網站（live＝湖面）

程式碼入口。**現役首頁是 LakeLanding**（`USE_LAKE=true`），不是 Cozy Galaxy 工作室。文章、履歷、交易研究與 `/protected` 路由維持獨立分頁。

Galaxy／WorkspaceDesktop 仍在 repo，由旗標與 e2e `testIgnore` 凍結。`config/site-system.yaml` 同時登記 **live 湖面**與凍結 Galaxy（契約 R04 仍要求 `elements.galaxy`）。

## 系統結構

```text
src/pages/index.astro                # USE_LAKE → LakeLanding | WorkspaceDesktop
src/features/workspace/elements/     # 現役：LakeLanding／Canvas／Overlay／Forecast／Gmail
src/features/workspace/core/         # cwa-snapshot、gmail-digest、lake-*、command-bus
src/features/workspace/WorkspaceDesktop.tsx  # 凍結分支
config/site-system.yaml              # live 湖面＋凍結 Galaxy（generate → site-system.ts）
src/features/articles/               # /articles 路由
src/components/workspace/            # facade only；新程式引用 features/
scripts/                             # site.mjs、sync-cwa、sync-gmail
verification/                        # unit、e2e（legacy specs 預設忽略）
```

## 公開內容資料流

```text
Obsidian canonical notes
└── config/public-content.json allowlist
    └── privacy/schema validation
        ├── src/data/generated/public-content.json
        └── config/public-content.lock.json
```

網站只部署已審核 projection，不直接讀取完整私人 Vault。AI Lab 是公開專案的組裝與導覽層，不是第二份專案正本。

## 指令

```bash
npm install
npm run dev
npm run site -- --help
```

| 指令 | 用途 |
|---|---|
| `npm run system:validate` | 驗證 `site-system.yaml` 與 generated registry 無 drift |
| `npm run system:generate` | 重新產生 `src/generated/site-system.ts` |
| `npm run content:check` | 只檢查已提交的公開 projection |
| `npm run content:verify` | 對照 Vault allowlist 與 projection |
| `npm run content:sync:dry` | 預覽同步，不寫檔 |
| `npm run content:sync` | 驗證後原子更新 projection 與 lock |
| `npm test` | 執行 Vitest unit tests |
| `npm run test:e2e` | 執行 Playwright 互動與路由測試 |
| `npm run verify` | unit → e2e → contracts → content → build |
| `npm run sync:cwa` | 中央氣象署預報抓取＋bake（需 Keychain `cwa`） |
| `npm run content:dsh` | 內容 DSH 演化試點 |
| `npm run verify:n-budget` | 導覽預算檢查 |
| `npm run verify:baseline-hashes` | 基線雜湊檢查 |
| `npm run verify:transition` | 轉場單一來源檢查 |
| `npm run build` | 驗證系統與公開內容後建立 Astro 靜態站 |

## 開發邊界

- 現役首頁互動在 LakeOverlay／側軌，不在 Galaxy Canvas 按鈕。
- WorkspaceDesktop 的「不在 Canvas 放字／四個 HTML 入口」只約束凍結分支。
- Trading Lab 只公開研究方法、歷史 evidence 與限制，不提供即時訊號或下單功能。
- `prefers-reduced-motion` 不得影響氣象／Gmail／文章可讀性。
- Production：`git push` `main` → `deploy.yml` → Cloudflare Pages。湖面已在 production，不是 branch-only preview。

## 設計與實作規格

- `plan/2026-09-05-site-system-refactor-design.md`
- `plan/2026-09-05-site-system-refactor-implementation.md`
- `ai-lab/README.md`

---
type: note
status: active
created: 2026-09-05
updated: 2026-09-05
tags:
  - project/personal-website
  - domain/ai-dev
source_exempt: true
---

# Cozy Galaxy AI Workshop

個人網站的唯一程式碼入口。網站以 **Astro + React island + Three.js** 組成一間可互動的溫馨宇宙工作室；文章、履歷、Vlog、交易研究與既有公開路由維持不變。

## 系統結構

```text
config/site-system.yaml              # 主幹／元素／功能／指令的唯一結構正本
├── src/generated/site-system.ts     # 由 YAML 產生的 runtime registry
├── src/features/workspace/          # React workspace 與 Command Bus
│   ├── core/                        # command-bus、contracts、window-state
│   ├── elements/                    # 星空、前景電腦、玩偶、氣氛與 hotspots
│   └── windows/                     # Dock、浮動視窗與內容 panels
├── src/features/articles/           # 文章路由規則
├── src/styles/workspace/            # tokens、shell、scene、elements、windows、responsive
├── scripts/commands/                # CLI domain handlers
├── scripts/lib/                     # schema、projection 與 command runtime
└── verification/                    # unit、e2e、deterministic contracts
```

`src/components/workspace/` 僅保留相容入口；新程式應引用 `src/features/workspace/`。

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
| `npm run build` | 驗證系統與公開內容後建立 Astro 靜態站 |

## 開發邊界

- 不在 Canvas 中放置內容文字；四個入口皆為 HTML button。
- Three.js 只負責窗外宇宙，電腦與玩偶是前景分層元素。
- Trading Lab 只公開研究方法、歷史 evidence 與限制，不提供即時訊號或下單功能。
- `prefers-reduced-motion`、WebGL fallback 與手機 adaptive quality 不得影響內容可用性。
- Production 部署仍由既有 Cloudflare Pages 流程處理；本重構預設只做 branch preview，不自動 push 或 deploy。

## 設計與實作規格

- `plan/2026-09-05-site-system-refactor-design.md`
- `plan/2026-09-05-site-system-refactor-implementation.md`
- `ai-lab/README.md`

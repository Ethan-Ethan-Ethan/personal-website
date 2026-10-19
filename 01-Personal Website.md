---
type: project
status: active
project: personal-website
created: 2026-06-15
updated: 2026-10-19
tags:
  - project/personal-website
  - domain/ai-dev
aliases:
  - 個人網站
  - Personal Website
  - Personal Website MOC
site_publish: true
site_visibility: public
site_section: projects
site_slug: personal-website
site_title: Personal Website
site_summary: 把內容管線、交易視覺化與個人品牌整合成可持續維護的 Astro 網站。
site_last_reviewed: 2026-10-19
site_featured: true
site_order: 10
site_demo_url: https://ethanyang.dpdns.org
site_highlights:
  - Astro 7 靜態內容架構
  - 湖面首頁＋氣象／Gmail 側欄（bake）
  - Cloudflare Pages 自動部署

---

# Personal Website

> **合併專案**：原 Personal-Website（內容建置）+ Website Design System（設計方法論）已整合為單一專案。
> 設計系統的方法論、模式庫與 Design Tokens 收錄於下方「設計系統」章節。

## 專案總覽

- **正式網站**：[https://ethanyang.dpdns.org/](https://ethanyang.dpdns.org/)
- **第二代 Astro 7 站**：`https://personal-website-bvk.pages.dev`（Cloudflare Pages，push to main 自動部署）
- **Repo**：`Ethan-Ethan-Ethan/personal-website`
- **狀態**：正式站 live 為湖面首頁（`USE_LAKE=true`，`main` 已部署）。Cozy Galaxy／透明前景為停用分支，不是現役焦點。代辦正本見 [[Dashboard]]
- **待完成（入口不重複列）**：網域續約 #5、Reddit 源 #6、樣式 #9。Decap／OAuth／履歷公開邊界／Workers 已關（Dashboard #1–#4、#7）
- **技術棧**：Astro 7 + React island + Three.js + Tailwind CSS v4 + Playwright/Vitest + Cloudflare Pages
- **域名**：`ethanyang.dpdns.org`（DigitalPlat FreeDomain，續期檢查 2027-02-15，到期 Jun 15, 2027）
- **成本**：全站零成本基礎設施（$0/月）
- **AI Lab 模組**：[[04_Projects/個人網站/ai-lab/README|AI Lab]]（網站組裝與公開映射；專案正文仍留原 Canonical Source）

## 目前焦點（2026-10-19）

```text
live 首頁（LakeLanding）
├── 湖面 Canvas＋魚群＋時段音訊
├── Overlay：房子鈕／側軌／底欄
│   ├── 總覽＝CWA 預報（cwa-snapshot.json，手動 npm run sync:cwa）
│   ├── Gmail＝週報 bake（gmail-digest.json，手動 sync-gmail.mjs）
│   ├── 文章＝本機組 md 面板（非 /articles 列表）
│   ├── 地區＝縣市選擇
│   └── 圖表／日曆／搜尋＝只亮燈（deferred）
└── About dialog；分頁 /articles /trading /resume /protected
```

- **開關**：`src/pages/index.astro` `USE_LAKE=true`。回滾湖面：改 `false` 才掛 WorkspaceDesktop。
- **凍結**：Cozy Galaxy（星空／前景 occluder／hotspot preview）、scene.*／window.* 命令、legacy e2e（預設 `testIgnore`）。
- **YAML**：`config/site-system.yaml` 已登記 lake-canvas／fish-layer／lake-overlay 為 live；Galaxy 元素保留凍結。`npm run system:generate` 後 `src/generated/site-system.ts` 必須無 drift。
- **發布狀態**：已在 `main`／production（2026-10-19 `curl` `/` 200，HTML 含 `lake-landing`）。

### 歷史焦點（2026-09-06 Cozy Galaxy，已凍結）

當時場景分層：房間底圖 → Three.js 星空／流星 → Alpha 前景電腦與玩偶。Grounding DINO＋SAM 2.1 素材已接入；人工驗收與 hotspot 二階段隨該分支凍結，不阻擋現役湖面。

## 里程碑

| 里程碑 | 日期 | 說明 |
|--------|------|------|
| Phase 1 | 2026-07-11 | Astro 7 專案初始化 + Tailwind v4 |
| Phase 2 | 2026-07-11 | Decap CMS 整合 |
| Phase 3 | 2026-07-12 | RSS 聚合管線（每日 UTC 02:00 排程） |
| Phase 4 | 2026-07-12 | Gmail 擷取管線（Google Apps Script + Gemini API） |
| Phase 5 | 2026-07-12 | 交易量化視覺化（Lightweight Charts + TradingView iframe） |
| Phase 6 | 2026-07-12 | 遷移到 Cloudflare Pages + 域名綁定 |
| WDS Phase 1-5 | 2026-07-10~11 | 網站設計系統：5 份標竿分析 + 36 模式 + Phase 5 重新設計方案 |
| WDS M1-M4 | 2026-07-11 | CSS 架構重構 + 元件完善 + Hero 文案 + 亮色主題 |
| DSH build pilot | 2026-09-04 | 受限於 source/config 的本機 Astro build verification；未啟用 launchd |
| Galaxy system refactor | 2026-09-05 | YAML 系統正本、Command Bus、分層場景、公開 projection 與整合驗證 |
| Foreground depth correction | 2026-09-06 | 本地 Grounding DINO＋SAM 2.1 產出桌機／手機 Alpha 前景並接入，待人工視覺驗收 |
| Evidence contract pilot | 2026-09-06 | YAML 假完成收斂試點：completion-evidence 台帳 + 5 模式 inferred 加標 + visual-fusion 快照 spec（基線待認可）+ Error Ledger 首案 UFE-20260906-001 |

> 詳細重建計畫：[[網站重建計畫 2026]]
> 設計系統詳情：下方「設計系統」章節

## 設計系統

> 原 Website Design System 專案。建立系統化網站設計方法論，分析標竿網站，提煉模式，完成個人網站重新設計。

### 方法論

- **website-analyzer skill**：分析任意網站的設計系統（10 維度：6 核心視覺 + 4 進階）
- **design-pattern-library**：累積 UI 模式庫，13 分類 + schema
- **典型情境**：看到喜歡的網站 → AI 分析拆解 → 學習設計模式 → 重組成自己的設計

### 外部專案資料夾

- 程式碼/腳本：`04_Projects/個人網站/design-system/`（純程式碼，無 .md）
- Skill 正本：`~/Documents/Agent-Skills/website-analyzer/SKILL.md`
- 設計模式庫：`04_Projects/個人網站/design-system/patterns/`（13 分類 + schema）
- 網站分析報告：`04_Projects/個人網站/design-system/analyses/`（Linear / NNg / Stripe / Vercel / 個人網站，共 2847 行）
- Console 腳本：`04_Projects/個人網站/design-system/tools/`（4 JS + 1 Python）

### 標竿分析成果

| 網站 | 分析深度 | 提煉模式 |
|------|----------|----------|
| Stripe | 939 行深度分析 | 13 個模式 |
| Vercel | 822 行深度分析 | 10 個模式 |
| Linear | 初步分析（WebFetch） | — |
| NNg | WebFetch 分析 | — |
| 個人網站 | 655 行（繞過 Cloudflare 403） | 17 個模式 |
| **總計** | **2847 行** | **36 個模式（13 分類）** |

### Phase 5 重新設計方案

> 基於 5 份分析 × 36 個模式 × 跨站改進計畫
> 生成日期：2026-07-11

**10 個核心模式**：

| # | 模式 | 來源 | 說明 |
|---|------|------|------|
| 1 | Section Heading Group | Stripe | kicker + 三層標題結構 |
| 2 | Shadow-as-Border Card | Vercel | box-shadow 取代 border，hover 加深 |
| 3 | Stat Counter Grid | Stripe | Hero 下方 3 欄信任信號 |
| 4 | Alternating Background | Stripe | panel 背景交替 |
| 5 | Health Dot | 現有 | 8px 綠點 + amber/red 變體 |
| 6 | Primary CTA Button | Stripe/Vercel | cream bg + pressed/focus-visible |
| 7 | Kicker | 現有 | 13px, 800 weight, uppercase, green |
| 8 | Card Hover Accent | 現有 | 微位移 + transition |
| 9 | Accessible ARIA Section | 現有 | aria-labelledby 模式 |
| 10 | Glassmorphism Topbar | 現有 | backdrop-filter + 滾動 shadow |

**首頁佈局**（保留 Dashboard metaphor）：
1. Topbar（sticky glassmorphism）
2. Hero（左欄品牌定位 + 右欄 TradingView）
3. Panel Switch（4 張摘要卡片）
4. Active Panel Content（一次顯示一個）
5. Footer（含社交連結）

**技術棧決策**：短期繼續純靜態 HTML → 中期（文章 >8 篇）評估 Astro（已完成）

**4 個里程碑**：
- M1：CSS 架構重構（spacing/type/color 變數 + component CSS）✅
- M2：色彩元件（shadow-as-border + hover + rgba 收斂 + focus-visible）✅
- M3：內容品牌（Hero 文案 + trust strip + summary-card）✅
- M4：長期品質（Footer 社交連結 + OG tags + Topbar + ARIA + 亮色主題 + tokens 文件）✅

### 設計 Tokens

> 4px base，暖色暗色系（`#11110f` base），品牌特徵 800 weight

#### Color — Dark Theme (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#11110f` | Page background |
| `--panel` | `#1b1b18` | Card / section panel bg |
| `--panel-2` | `#22221e` | Secondary panel |
| `--line` | `#37372f` | Borders / dividers |
| `--text` | `#f3f0e8` | Primary text |
| `--muted` | `#b9b3a5` | Secondary text |
| `--soft` | `#8f897b` | Meta text |
| `--green` | `#88b56b` | Accent / success |
| `--amber` | `#d4a34b` | Warning |
| `--blue` | `#76a7bd` | Info / link |
| `--red` | `#c46f5a` | Error |

#### Color — Light Theme (`prefers-color-scheme: light`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#fafaf8` | Page background |
| `--panel` | `#ffffff` | Card / section panel |
| `--panel-2` | `#f5f5f0` | Secondary panel |
| `--line` | `#e5e2da` | Borders |
| `--text` | `#1a1a18` | Primary text |
| `--muted` | `#6b6860` | Secondary text |
| `--green` | `#5a8a3f` | Accent |
| `--amber` | `#b8862a` | Warning |
| `--blue` | `#4a7a92` | Info / link |
| `--red` | `#a84a35` | Error |

#### Spacing（4px base）

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` ~ `--space-10` | 4px ~ 96px | 完整 scale |
| `--card-padding-sm/md/lg` | 16/20/24px | 卡片 padding |
| `--container-narrow/default/wide` | 860/1080/1180px | 容器寬度 |

#### Typography

- **Font**：Inter + "Noto Sans TC" + "PingFang TC"
- **Sizes**：`--text-xs`(12px) ~ `--text-4xl`(clamp 32-48px)
- **Line heights**：`--leading-none`(1.0) ~ `--leading-relaxed`(1.8)
- **Letter spacing**：`--tracking-tight`(-0.02em) / `--tracking-normal`(0) / `--tracking-wide`(0.12em)

#### Shadow

| Token | Dark | Light |
|-------|------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.2)` | `0 1px 2px rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.25)` | `0 4px 12px rgba(0,0,0,0.08)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.3)` | `0 8px 24px rgba(0,0,0,0.10)` |
| `--shadow-hover` | `0 8px 28px rgba(0,0,0,0.35)` | `0 8px 28px rgba(0,0,0,0.12)` |

#### White/Black Overlay Constants

| Token | Dark | Light |
|-------|------|-------|
| `--white-04` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.03)` |
| `--white-06` | `rgba(255,255,255,0.06)` | — |
| `--white-08` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
| `--white-12` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.10)` |
| `--white-16` | `rgba(255,255,255,0.16)` | `rgba(0,0,0,0.14)` |

#### Misc

| Token | Value |
|-------|-------|
| `--radius` | 8px |

### 工具套件

4 個 Console 腳本，從任意網站提取設計系統：

| 工具 | 功能 |
|------|------|
| `extract-design-tokens.js` | 顏色/字體/間距/陰影/圓角/佈局/元件 |
| `check-accessibility.js` | WCAG AA/AAA 對比度、鍵盤導航、alt、ARIA |
| `analyze-performance.js` | 載入時間、資源大小、lazy loading、DOM 節點 |
| `analyze-seo.js` | Meta 標籤、標題結構、內容品質、連結 |

**分析框架（10 維度）**：Layout / Spacing / Color / Typography / Animation / Component / Information Architecture / Brand Identity / Accessibility / Conversion

**工作流**：提取 tokens → 檢查 a11y → 分析效能 → 分析 SEO → 整理 YAML → 存入模式庫

### 截圖工作流規範

| 視圖 | 寬度 | 用途 |
|------|------|------|
| Desktop | 1440px | 主要參考 |
| Mobile | 375px | 手機版 |

**命名慣例**：`screenshots/{domain}/{domain}-fullpage-{desktop|mobile}.png`

**方法**：Chrome DevTools（1-2 站）或 Playwright 批次（3+ 站）

## 內容分區

> 網站內容索引與素材分類（2026-10-18 註記：vlog／visual-design／resume-links／website-deploy 目前為剪報箱性質，未接入 sync；若算內容庫則不凍，若算閒置則待你定義後補凍結標記，不自行封存）

- **履歷**：引用既有正本（`04_Projects/個人網站/履歷/`），不在本專案複製
- **Vlog**：影片剪輯、旁白、素材整理流程 → `vlog/`
- **心得**：可公開文章、生活/工作觀點 → `reflections/`（預留）
- **網站部署**：網域、Cloudflare、DNS → 下方「網站部署」章節
- **視覺設計**：個人品牌、版面、形象照 → `visual-design/`
- **履歷素材**：履歷相關素材與入口 → `resume-links/`

### 首頁規劃（live＝湖面；Galaxy 樹為歷史）

```text
LakeLanding（USE_LAKE=true）
├── 時段名 SplitText＋播放鍵
├── 氣象玻璃／Gmail／文章面板／地區
└── 右上時間＋About
```

- 主文案仍：**我打造能持續驗證與演化的 AI 系統。**（noscript／品牌）
- 可拖曳視窗／hash／AI Lab 浮動窗＝WorkspaceDesktop，**現役首頁不走這條**。
- CLI 仍：`npm run site -- <domain> <action>`。結構 YAML 見上「YAML」條。
- About：`src/components/AboutDialog.astro`；完整履歷 `/resume` 與 `/protected/resume`。

## 網站部署

### 第二代部署流程（Astro 7 + Cloudflare Pages）

```
git push (main)
  → Cloudflare Pages detects push
  → Runs: astro build
  → Output: dist/
  → Deploys to: personal-website-bvk.pages.dev
  → Custom domain: ethanyang.dpdns.org (CNAME proxied)
```

### GitHub Actions workflows

| Workflow | Trigger | 說明 |
|----------|---------|------|
| `deploy.yml` | push to main | 自動部署到 Cloudflare Pages（與 Pages 原生整合重複，保留供擴充） |
| `rss-aggregate.yml`（2026-10-18 註記：磁碟僅存 deploy.yml，本檔缺失；待補或改以手動流程） | daily UTC 02:00 | RSS 聚合 → auto-commit Markdown |

### Cloudflare Pages 設定

- **Project**：`personal-website`
- **Build command**：`astro build`
- **Output**：`dist/`
- **Auth**：wrangler OAuth（`wrangler login`）— NOT API Token

### Local DSH build pilot（未啟用排程）

- **唯一 task 正本**：[`config/automation.yaml`](config/automation.yaml) 的 `website.build.scoped`。
- **固定執行契約**：僅以固定 argv `npm run build` 在本專案目錄執行；policy 為 `generated_state`，只允許重生 `dist/` 與工具快取，不寫入網站正本或對外部署。
- **觸發範圍**：`src/**`、`public/**`、`package.json`、`package-lock.json`、`astro.config.mjs`、`tsconfig.json`；其他筆記、部署設定與憑證相關檔案不會匹配。
- **驗收**：exit zero、JSON build contract、`dist/index.html` 存在；失敗由 Runtime evidence packet/review queue 處理，不自動修復。
- **驗證狀態**：2026-09-04 已在隔離 SQLite ledger 完成一次 source event → build → eval 的去重 run；來源檔 SHA 前後一致。
- **邊界**：`com.ethan.dsh.runtime` 目前僅載入 Graphify manifest，因此本 task 尚未由 launchd 自動執行、也不會部署到 Cloudflare。須累積 30 次可追溯且無重複 run，才提出啟用／替換入口提案。
- **延後項目與重新評估條件**：link check 與 Lighthouse 尚未導入；待選定已安裝、可重現的 headless 工具及其固定品質 contract 後，再各自以獨立 task 試點。

### DNS 設定

- **Nameservers**：`camilo.ns.cloudflare.com` / `sonia.ns.cloudflare.com`
- **DNS record**：CNAME `ethanyang.dpdns.org` → `personal-website-bvk.pages.dev`（proxied: true）
- **SSL**：Full (strict)
- **Domain source**：DigitalPlat FreeDomain（續期檢查 2027-02-15，到期 Jun 15, 2027）

### 驗證 checklist

```bash
curl -I https://ethanyang.dpdns.org/           # expect 200
curl -I https://ethanyang.dpdns.org/articles/   # expect 200
curl -I https://personal-website-bvk.pages.dev/ # expect 200
```

## 待辦清單（2026-10-18 註記：本節為歷史快照；代辦正本以 Dashboard.md「代辦清單（正本，已去重）」為準。Decap 已放棄、Workers 已刪、Access 已生效，見 Dashboard #1/#3/#4）

### 待完成

- [x] P0：人工驗收桌機／手機 Alpha 前景 — 2026-10-19 改標凍結（Galaxy 分支；live 已是湖面且 `main` 已部署，不再擋合併）
- [x] Phase 2：GitHub OAuth 驗證（Decap CMS 瀏覽器登入）— 已放棄，見 Dashboard #1
- [x] Phase 2：測試瀏覽器寫文章 → commit → 自動部署 — 已取消，見 Dashboard #2
- [x] Phase 6：Cloudflare Access 設定（`/protected/*` 路由保護）— ✅ 2026-08-27 實測已生效
- [x] Phase 6：停用舊 Workers 部署（`steep-glitter-0952`）— ✅ 2026-08-27 已刪除 script
- [ ] 域名續約檢查 — 正本 Dashboard #5（窗口 2027-02-15，非 2026-11-12）
- [ ] Reddit 替代 RSS 源評估 — 正本 Dashboard #6
- [x] 檢查履歷中哪些內容適合公開 — Dashboard #7 已上線 `/resume/`

### 已完成

- [x] 決定發布工具：Astro 7 + Cloudflare Pages
- [x] 決定網站首頁定位：工作台式個人首頁
- [x] 建立公開心得文章清單
- [x] P0：首頁資訊密度收斂成「我是誰 / 我在整理什麼 / 你可以看什麼」
- [x] P1：文章頁共同版型（日期、分類、標籤、SEO metadata）
- [x] P2：部署流程文件化
- [x] P3：Obsidian → 網站輸出流程
- [x] Phase 1-6 既有網站管線完成
- [x] Cozy Galaxy 系統骨架、Command Bus、公開 projection 與 verification commands
- [x] 完成 branch preview 的視覺與內容人工審核後再合併 `main` — 2026-10-19：production 已是湖面，本條過期關閉

## 封存文件

> 第一代 Workers 靜態版相關文件，保留作歷史參考但不適合優先引用。

| 文件 | 說明 |
|------|------|
| [[04_Projects/個人網站/封存/README|README]] | 第一代專案總覽（Workers 靜態版） |
| [[04_Projects/個人網站/封存/個人網站建置工作流程|個人網站建置工作流程]] | 第一代 Workers 建置流程 |
| [[04_Projects/個人網站/封存/Cloudflare 與 API 部署紀錄|Cloudflare 與 API 部署紀錄]] | Workers 部署流程（Pages 已取代） |
| [[04_Projects/個人網站/封存/Cloudflare API 與 Wrangler 紀錄|Cloudflare API 與 Wrangler 紀錄]] | 舊版 API Token 設定（OAuth 已取代） |
| [[04_Projects/個人網站/封存/DNS 與網域綁定紀錄|DNS 與網域綁定紀錄]] | 舊版 DNS 設定 |
| [[04_Projects/個人網站/封存/網站部署 SOP|網站部署 SOP]] | 第一代手動部署 SOP |
| [[04_Projects/個人網站/封存/Obsidian 到網站輸出流程|Obsidian 到網站輸出流程]] | 第一代靜態 HTML 輸出流程 |

## 萃取紀錄

| 日期 | 萃取內容 | 類型 | 目的地 |
|------|---------|------|--------|
| 2026-07-24 | JavaScript regex 中文處理（`\w` vs CJK） | 踩坑 | `01_Notes/` |
| 2026-07-24 | RSS XML CDATA 解析陷阱 | 踩坑 | `01_Notes/` |
| 2026-07-24 | WebFetch + console scripts 雙軌分析 | 工作流 | `01_Notes/` |
| 2026-07-24 | 4px base 遷移策略 | 設計決策 | `01_Notes/` |
| 2026-07-24 | 品牌特徵優先於趨勢 | 設計原則 | `01_Notes/` |
| 2026-07-24 | GitHub Actions 兩階段認證 | SOP | `02 Domain/AI編程代理系/Domain artifact/個人自動化/` |
| 2026-07-24 | Design token 系統化方法論 | 方法論 | 內嵌於本頁「設計 Tokens」章節（未獨立畢業至 02 Domain/AI編程代理系/Domain artifact/設計/） |

## 相關筆記

- [[AI 編程代理]]
- [[Claude Skills 是把專業流程封裝成可重用的技能模組]]

## 相關 MOC

- [[AI 編程代理]]

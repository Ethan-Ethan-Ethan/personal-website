---
type: project
status: active
project: personal-website
created: 2026-06-15
updated: 2026-07-12
tags:
  - project/personal-website
  - domain/ai-dev
aliases:
  - 個人網站
  - Personal Website
  - Personal Website MOC
---

# Personal Website

> **合併專案**：原 Personal-Website（內容建置）+ Website Design System（設計方法論）已整合為單一專案。
> 設計系統的方法論、模式庫與 Design Tokens 收錄於下方「設計系統」章節。

## 專案總覽

- **正式網站**：[https://ethanyang.dpdns.org/](https://ethanyang.dpdns.org/)
- **第二代 Astro 7 站**：`https://personal-website-bvk.pages.dev`（Cloudflare Pages，push to main 自動部署）
- **Repo**：`Ethan-Ethan-Ethan/personal-website`
- **狀態**：Phase 1-6 全部完成（Astro 重建 + RSS 聚合 + Gmail 擷取 + 交易視覺化 + Pages 部署 + 設計系統）
- **待完成**：Cloudflare Access（`/protected/*`）、停用舊 Workers 部署
- **技術棧**：Astro 7 + Tailwind CSS v4 + Decap CMS + GitHub Actions + Cloudflare Pages
- **域名**：`ethanyang.dpdns.org`（DigitalPlat FreeDomain，續期檢查 2026-11-12）
- **成本**：全站零成本基礎設施（$0/月）

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

> 網站內容索引與素材分類

- **履歷**：引用既有正本（`04_Projects/個人網站/履歷/`），不在本專案複製
- **Vlog**：影片剪輯、旁白、素材整理流程 → `vlog/`
- **心得**：可公開文章、生活/工作觀點 → `reflections/`（預留）
- **網站部署**：網域、Cloudflare、DNS → 下方「網站部署」章節
- **視覺設計**：個人品牌、版面、形象照 → `visual-design/`
- **履歷素材**：履歷相關素材與入口 → `resume-links/`

### 首頁規劃

- 首頁：左右雙欄 Dashboard；左側工作台摘要，右側 TradingView K 線圖與觀察清單
- 工作台卡片：點擊後滑動到下方並顯示對應面板（待辦健康度、週報新聞、經驗沉澱等）
- 右上導覽：固定履歷、Vlog
- 文章區：Dashboard 風格文章列表 + 單篇閱讀

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
| `rss-aggregate.yml` | daily UTC 02:00 | RSS 聚合 → auto-commit Markdown |

### Cloudflare Pages 設定

- **Project**：`personal-website`
- **Build command**：`astro build`
- **Output**：`dist/`
- **Auth**：wrangler OAuth（`wrangler login`）— NOT API Token

### DNS 設定

- **Nameservers**：`camilo.ns.cloudflare.com` / `sonia.ns.cloudflare.com`
- **DNS record**：CNAME `ethanyang.dpdns.org` → `personal-website-bvk.pages.dev`（proxied: true）
- **SSL**：Full (strict)
- **Domain source**：DigitalPlat FreeDomain（續期檢查 2026-11-12）

### 驗證 checklist

```bash
curl -I https://ethanyang.dpdns.org/           # expect 200
curl -I https://ethanyang.dpdns.org/articles/   # expect 200
curl -I https://personal-website-bvk.pages.dev/ # expect 200
```

## 待辦清單

### 待完成

- [ ] Phase 2：GitHub OAuth 驗證（Decap CMS 瀏覽器登入）
- [ ] Phase 2：測試瀏覽器寫文章 → commit → 自動部署
- [ ] Phase 6：Cloudflare Access 設定（`/protected/*` 路由保護）
- [ ] Phase 6：停用舊 Workers 部署（`steep-glitter-0952`）
- [ ] 域名續約檢查（2026-11-12）
- [ ] Reddit 替代 RSS 源評估
- [ ] 檢查履歷中哪些內容適合公開

### 已完成

- [x] 決定發布工具：Astro 7 + Cloudflare Pages
- [x] 決定網站首頁定位：工作台式個人首頁
- [x] 建立公開心得文章清單
- [x] P0：首頁資訊密度收斂成「我是誰 / 我在整理什麼 / 你可以看什麼」
- [x] P1：文章頁共同版型（日期、分類、標籤、SEO metadata）
- [x] P2：部署流程文件化
- [x] P3：Obsidian → 網站輸出流程
- [x] Phase 1-6 全部完成

## 封存文件

> 第一代 Workers 靜態版相關文件，保留作歷史參考但不適合優先引用。

| 文件 | 說明 |
|------|------|
| [[封存/README]] | 第一代專案總覽（Workers 靜態版） |
| [[封存/個人網站建置工作流程]] | 第一代 Workers 建置流程 |
| [[封存/Cloudflare 與 API 部署紀錄]] | Workers 部署流程（Pages 已取代） |
| [[封存/Cloudflare API 與 Wrangler 紀錄]] | 舊版 API Token 設定（OAuth 已取代） |
| [[封存/DNS 與網域綁定紀錄]] | 舊版 DNS 設定 |
| [[封存/網站部署 SOP]] | 第一代手動部署 SOP |
| [[封存/Obsidian 到網站輸出流程]] | 第一代靜態 HTML 輸出流程 |

## 萃取紀錄

| 日期 | 萃取內容 | 類型 | 目的地 |
|------|---------|------|--------|
| 2026-07-24 | JavaScript regex 中文處理（`\w` vs CJK） | 踩坑 | `01_Notes/` |
| 2026-07-24 | RSS XML CDATA 解析陷阱 | 踩坑 | `01_Notes/` |
| 2026-07-24 | WebFetch + console scripts 雙軌分析 | 工作流 | `01_Notes/` |
| 2026-07-24 | 4px base 遷移策略 | 設計決策 | `01_Notes/` |
| 2026-07-24 | 品牌特徵優先於趨勢 | 設計原則 | `01_Notes/` |
| 2026-07-24 | GitHub Actions 兩階段認證 | SOP | `05_Reference/個人自動化/` |
| 2026-07-24 | Design token 系統化方法論 | 方法論 | 內嵌於本頁「設計 Tokens」章節（未獨立畢業至 05_Reference/設計/） |

## 相關筆記

- [[AI 編程代理]]
- [[Claude Skills 是把專業流程封裝成可重用的技能模組]]

## 相關 MOC

- [[AI 編程代理]]

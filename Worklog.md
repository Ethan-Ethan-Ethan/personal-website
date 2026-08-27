---
type: note
project: personal-website
created: 2026-06-15
updated: 2026-07-24
status: seedling
---

# Worklog — Personal Website（含 Website Design System）

> 合併專案工作紀錄：原 Personal-Website（Astro 7 重建）+ Website Design System（設計方法論）

## 問題與解法

### WDS 設計系統

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| WebFetch 無法讀取 CSS styles | 工具只能抓 HTML 結構 | 建立 4 個 console scripts | ✅ |
| Cloudflare 403 攔截個人站分析 | Cloudflare 防護 | 從原始碼直接分析 | ✅ |
| 卡片 padding 不統一（18/20/22/24px） | 無統一 base unit | 4px base → sm/md/lg 命名變數 | ✅ |
| h1 跨頁不一致（28-48px） | 無 typography scale | 定義 --text-xs ~ --text-4xl | ✅ |
| CSS 散落 7 個 HTML 檔 | 無外部樣式表 | 提取為 styles.css + components/*.css | ✅ |
| panel toggle 無鍵盤支援 | 只有 click 事件 | keyboard handler + History API | ✅ |
| rgba 值散落未收斂 | 各處硬編碼 | 定義 --white-04/06/08/12/16 | ✅ |
| 無 scroll 動畫 | 全站 0 個 micro-interaction | IntersectionObserver + CSS transitions | ✅ |
| Hero 缺乏價值主張 | 原始文案為「工作台摘要」 | 重寫 kicker + h1 + lead + trust strip | ✅ |

### Phase 1-3（Astro 重建）

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| RSS XML CDATA 解析失敗 | 自寫解析器未處理 CDATA | 加入 CDATA stripping 函式 | ✅ |
| 中文 slugify 產生空字串 | JS `\w` 不含中文 | regex 加 CJK range `一-鿿` | ✅ |
| Reddit RSS 403 | Reddit 封鎖伺服器端 RSS | 改用 RSSHub 36Kr 源 | ✅ |
| Cloudflare API DNS 權限不足 | Token scope 只給 Workers | 補 Zone DNS Edit 權限 | ✅ |
| Guardrail 擋 rm 指令 | 全域 guardrail 禁止 rm | 改用 trash 指令 | ✅ |

### Phase 4-5

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| TradingView widget async 載入失敗 | Astro Islands 與 TradingView 非同步初始化衝突 | 改用獨立 iframe 頁面 embed | ✅ |
| RSS 中文標題 slug 路徑衝突 | 動態路由 slug 取自完整檔名路徑 | `post.id.split('/').pop()` 取最後一段 | ✅ |
| GitHub Actions workflow push 權限不足 | GITHUB_TOKEN 預設無 workflow scope | `gh auth refresh -s workflow` 補足 | ✅ |
| gh CLI OAuth token 失效 | macOS Keychain token 過期/SSL 錯誤 | 裝置授權流程重新認證 | ✅ |
| GitHub Secrets 設定混淆 | 誤以為 gh CLI 授權 = 部署權限 | 明確區分兩階段認證 | ✅ |

## 學到的知識

### WDS 設計系統
- 4px base 比 8px 更適合現有奇數值網站的平滑遷移
- WebFetch + console scripts 雙軌分析流程
- Design token 系統化：從散亂值到 CSS 自訂屬性的方法論
- 標竿網站分析框架：10 維度（6 核心視覺 + 4 進階）
- Shadow-as-Border 模式：用 box-shadow 取代 border
- 品牌特徵優先於趨勢：保留 800 weight

### Astro 7 重建
- Astro 7 Content Collections + Cloudflare Pages 部署流程
- 純 Node.js RSS 解析（無外部套件，內建 XML regex parser）
- GitHub Actions 排程觸發 + auto-commit 模式
- Decap CMS 架構（Git-based CMS，純靜態 SPA）
- JavaScript regex 的 `\w` 只管 ASCII，CJK 需手動加 Unicode range
- CDATA 標籤處理是 XML 解析的常見陷阱
- TradingView iframe embed 隔離策略
- Google Apps Script + Gemini API 擷取 Gmail Newsletter
- Astro 動態路由 slug 處理：巢狀目錄需萃取最後一段
- GitHub Actions 的 GITHUB_TOKEN scope 管理
- CI/CD 兩階段認證：gh CLI（推程式碼）≠ Secrets（部署）

## 可引用素材（履歷用）

**一句話描述：**
> 以 Astro + Cloudflare Pages 重建個人網站，建立零成本 RSS 自動聚合管線、Gmail 內容擷取系統與 Git-based CMS 工作流；同時建立網站設計分析系統，分析 5 個標竿網站並提煉 36 個設計模式，完成完整 Design Tokens 規範與 CSS 架構重構。

**技術關鍵字：** Astro 7, Tailwind CSS v4, Cloudflare Pages, GitHub Actions, Decap CMS, Google Apps Script, Gemini API, TradingView / Lightweight Charts, Design System, Design Tokens, DNS 管理, CI/CD, Accessibility (WCAG)

**量化成果：**
- 全站零成本基礎設施（$0/月）
- 5 份標竿分析（2847 行）+ 36 個設計模式（13 分類）
- 4 個分析工具（JS console scripts）
- RSS 管線每日自動聚合 3+ 來源
- Gmail 擷取管線自動提取 Newsletter
- 部署時間從手動 zip 上傳（5-10 min）→ git push 自動部署（< 2 min）
- 35 頁面成功建置，CSS 減少 171 行
- 4 個里程碑全數完成

## 關聯

- 專案主頁：[[Personal Website]]
- 重建計畫：[[網站重建計畫 2026]]
- 踩坑索引：[[04_Projects/知識處理/影片分析工作流/Worklog]]
- RSS 管線：[[RSS 聚合管線-行動流程]]
- 畢業原子筆記：[[第三方 widget 與 SPA 非同步初始化衝突時用 iframe 隔離]]
- 畢業 Reference：[[Personal Website#設計-Tokens]]（Design Tokens 內嵌於專案主頁「設計 Tokens」章節，尚未獨立畢業至 05_Reference）

---

## 歷史紀錄（保留最近 3 條）

### 2026-07-11 ~ 07-12 Astro 7 重建 Phase 1-6

- 成功部署 Astro 7 到 Cloudflare Pages，域名 `ethanyang.dpdns.org` 綁定生效
- 建立 RSS 聚合管線：純 Node.js + GitHub Actions 每日排程，零外部依賴
- 設定 Decap CMS + GitHub Actions 自動部署
- 建立 Gmail 擷取管線：Google Apps Script + Gemini API
- 整合 TradingView 交易圖表（iframe embed）
- GitHub Secrets 設定完成，自動部署上線

### 2026-07-10 ~ 07-11 Website Design System

- 建立 website-analyzer skill（6+4 維度分析框架）
- 完成 5 份標竿網站分析報告（共 2847 行），提煉 36 個設計模式
- 設計 4 個控制台腳本（token 提取、a11y、perf、SEO）
- 完成 Phase 5 重新設計方案（design tokens + 4px spacing + CSS 重構）
- CSS 抽離為 styles.css + 10 個 component CSS 檔
- JS 互動：scroll fade-in + History API panel routing + TradingView lazy load

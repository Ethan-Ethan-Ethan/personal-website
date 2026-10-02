---
type: dashboard
project: personal-website
status: active
created: 2026-08-27
updated: 2026-09-06
tags:
  - project/personal-website
---

# 個人網站 Dashboard

> 單一追蹤面：狀態 / 代辦（去重正本）/ 網域續簽 / 如何開啟與編輯。
> 詳細設計與決策見 [[01-Personal Website]]，重建計畫見 [[網站重建計畫 2026]]。

## 狀態總覽

| 項目 | 值 |
|---|---|
| 正式站 | https://ethanyang.dpdns.org/ |
| Pages URL | https://personal-website-bvk.pages.dev |
| 框架 | Astro 7 + Tailwind v4 + GitHub Actions + Cloudflare Pages |
| Repo | `Ethan-Ethan-Ethan/personal-website` |
| 部署觸發 | `git push` → `main` → `.github/workflows/deploy.yml` 自動部署 |
| RSS 排程 | `.github/workflows/rss-aggregate.yml` 每日 UTC 02:00 |
| 整體狀態 | Cozy Galaxy P0 視覺重構進行中：房間、流星遮擋、披風微動畫與 responsive runtime 已建立；螢幕小方框＋底部連結 preview 已完成本地實作與自動驗證，目前等待人工確認構圖，再決定第二階段直接連結或 floating window |

## 代辦清單（正本，已去重）

> 來源去重：`01-Personal Website.md` 與 `網站重建計畫 2026.md` 原本各寫一份重複清單，此處為唯一正本。

- [x] **#1 Decap CMS GitHub OAuth 驗證** — ✅ 2026-08-27 決議**放棄 Decap**（路線 B）並從 repo 移除 `public/admin/`；live `/admin/*` 剩 DigitalPlat edge 快取殘留（等 ≤7 天 TTL）。孤兒 GitHub OAuth App（client_id `Ov23liWBSrm6U8VNv6Zi`）已於 2026-08-27 由使用者在 GitHub UI 刪除 → #1 完全收尾。
- [ ] **#2 測試「瀏覽器寫文章 → commit → 自動部署」** — ❌ 隨 #1 放棄 Decap 而取消；改用 #C 手動寫文流程（直接新增 `src/content/posts/*.md` 並 `git push`）。
- [x] **#3 Cloudflare Access 設定（`/protected/*` 路由保護）** — ✅ 2026-08-27 實測生效：未帶憑證訪問 /protected/resume 回傳 302 導向 cloudflareaccess.com 登入；App「Ethan Personal Website Protected」允許 isitoled@gmail.com（GitHub IdP）。原計畫書「待完成」為過期狀態。
- [x] **#4 停用舊 Workers 部署（`steep-glitter-0952`）** — ✅ 2026-08-27 已透過 Cloudflare API 刪除 script（剩 isitoled / red-mode-ea77，非目標）。舊站徹底停用。
- [ ] **#5 網域續簽** — 期限 **2026-11-12**；SOP 與追蹤已建（見專區）。續簽窗口約 2026-10-13 起，**現過早不續，待窗口內執行**
- [ ] **#6 Reddit 替代 RSS 源評估** — 已評估：Reddit 伺服器端 403 早已由「改用 RSSHub 36Kr 源」緩解（feeds 現無 Reddit，見 踩坑紀錄/Worklog）。若要真 Reddit 內容，替代方案：①Reddit OAuth API（需建 Reddit app + 憑證）②穩定 RSSHub/Redlib 實例（公共實例不穩）。待你決定是否要真 Reddit。
- [ ] **#7 檢查履歷公開 / 私人邊界** — ✅ 已做公開「摘要版履歷頁」：`src/pages/resume.astro`（職稱/時間/雇主/技能/學歷/摘要，**去機密**：隱藏電話、客戶名稱與量化細節），導覽「履歷」與首頁卡片改指向 `/resume`；完整版仍留 `/protected/resume`（Cloudflare Access）。`astro build` 859 頁通過。**待 push 上線（使用者 2026-08-27 選本地保留，未推）**。
- [x] **#8 工作台卡片滑動面板功能** — ✅ 2026-08-27 實作：首頁新增「工作台」區塊，3 卡片（待辦健康度 / 週報 / 經驗沉澱）點擊後用 `grid-template-rows: 0fr→1fr` 滑出下方面板；`astro build` 35 頁通過。週報 / 經驗沉澱面板內容待填。
- [ ] **#9 網站樣式優化** — 2026-08-27 使用者表態想做網頁樣式；採用開源 skill `dembrandt/dembrandt-skills`（已 clone 至 `Agent-Skills/dembrandt-skills`，41 個 UX/design-system 技能，經 `~/.config/opencode/skills → Agent-Skills` 既有 symlink 自動載入；MIT）。dembrandt MCP 引擎已接（本地 stdio，`opencode.jsonc` 的 `mcpServers.dembrandt`）；實測 `dembrandt https://ethanyang.dpdns.org` 擷取成功（顏色 9 / 字體 19 / 間距 12 / 圓角 4 / 按鈕 2 變體，與 global.css 一致），Cloudflare 未擋。MCP 工具需重啟 OpenCode 才載入；CLI 已可直接用。下一步：把 tokens 存到 `design-system/` 供 `website-analyze` 用，並挑子技能（color-mode-and-theme / algorithmic-color-palette / component-family-consistency / wcag-accessibility）套用優化。
- [x] **#10 Cozy Galaxy 玩偶披風微動畫** — Desktop／Tablet／Mobile 已接入照片披風 Alpha 三段 CSS rig，使用者已確認可見且速度調整後可接受；未做 clean plate 或 AI inpainting。設計正本：`/Users/ethan/Documents/memory/design/2026-09-06-personal-website-plush-cape-motion-design.md`。
- [x] **#11 螢幕小方框與底部連結 Preview（第一階段）** — 已隱藏頂部導覽與常駐文字卡片；四個螢幕方框和四個底部 UI 共用局部小視窗與 SVG 指向線。Pointer／focus ownership、Escape、resize、Tablet fallback、Mobile tap 與不霧化 pixel contract 均完成。第一階段刻意不導航、不改 hash、不開 floating window；等待人工構圖確認後再決定第二階段連結方式。計畫：`plan/2026-09-06-monitor-hotspot-popover-implementation.md`。

## 網域續簽專區（#5）

| 項目 | 值 |
|---|---|
| 網域 | `ethanyang.dpdns.org` |
| 來源 | DigitalPlat FreeDomain（免費方案） |
| 續期方式 | 每 ~150 天**手動**續期 |
| 下次檢查日 | **2026-11-12** ⚠️ |
| 管理後台 | https://dash.domain.digitalplat.org （GitHub OAuth 登入） |
| API key | `DIGITALPLAT_API_KEY`（Keychain service=`digitalplat`）已確認可取；但續簽 endpoint 需從 Dashboard API 文件取得，不對外硬編 |

### 續簽 SOP（依 DigitalPlat 官方文件 5.2-renewal-and-expiration）
1. 登入 https://dash.domain.digitalplat.org （GitHub OAuth）
2. 閱讀當前公告與政策變更
3. 確認網域與帳號正確
4. 確認 registrant 聯絡資訊為最新
5. 檢視續簽結果、slot 使用與任何費用
6. 完成續簽
7. 在網域清單確認**新到期日**
8. 留存非敏感紀錄（新到期日）

### 追蹤
- 免費方案無自動續期，**必須在到期前手動續**，否則網域可能被釋出（同時中斷 DNS 委派 / 網站 / 憑證）。
- FreeDomain 通常僅在到期前 ~30 天開放續簽 → **建議動作日：~2026-10-13 起**。
- 現狀（2026-08-27）：距到期 ~2.5 個月，過早續簽會浪費天數且可能被拒，**暫不續**，待窗口內再執行。
- 實際續簽：優先用後台手動（最穩）；若走 API，需先從 Dashboard 取得正確 endpoint 並確認在窗口內，且不得對 ambiguous 回應自動重試。

## #3 執行步驟（Cloudflare 後台，需手動）

> ✅ **2026-08-27 實測：Access 已生效**（線上 `/protected/*` 會擋未授權訪客，回傳 302 導向 cloudflareaccess.com 登入）。下方步驟僅供日後重設/參考，一般情況無需執行。
>
> 原有說法「本地無憑證、需手動設定」已過期——當時未實測線上狀態，實則 App「Ethan Personal Website Protected」早已綁定 `ethanyang.dpdns.org/protected/*` 並允許 `isitoled@gmail.com`（GitHub IdP）。

1. 開 https://one.dash.cloudflare.com → 選帳號 → **Zero Trust** → **Access** → **Applications**
2. 若舊 Workers 的 Access App 仍存在：編輯它，把 **Hostname** 從舊 Workers 網址改為 `ethanyang.dpdns.org`
3. 否則 **Add application → Self-hosted**：
   - Application name：`personal-website-protected`
   - **Hostname：`ethanyang.dpdns.org`**
   - **Path：`/protected/*`**
   - **Policies → Add a rule**：
     - Action：**Allow**
     - 條件（擇一，建議用 email 最簡單）：
       - `Emails` = 你的 email（如 ethan@example.com）；或
       - `Login methods` = GitHub（需先於 Settings → Identity Providers 加 GitHub IdP）
   - 儲存
4. 確認 DNS 中 `ethanyang.dpdns.org` 為 **proxied（橘雲）**，Access 才能攔截
5. 測試：瀏覽 `https://ethanyang.dpdns.org/protected/resume` → 應跳出 Access 登入；非授權者被擋

> 費用：Cloudflare Access 免費層含最多 50 名使用者，個人使用足夠。

## 如何開啟與編輯網頁

### A. 本機預覽（開發）
```bash
cd ~/Documents/Obsidian\ Vault/04_Projects/個人網站
npm run dev          # 或 astro dev --background
# 預覽網址：http://localhost:4321
# 停止：astro dev stop ｜ 狀態：astro dev status ｜ 日誌：astro dev logs
```

### B. 透過 Decap CMS 瀏覽器編輯（目標流程，**被 #1 阻擋**）
> ⚠️ 現狀：`auth: github` 走 Netlify 閘道（已停用 404），自訂 client_id 無效。
> 需先架設 **External OAuth Client proxy** 並把 `auth` 指向它，本流程才可用。
1. 開瀏覽器前往 `https://ethanyang.dpdns.org/admin/`
2. 點「Login with GitHub」授權（需 proxy 就位後才會導向 `github.com/login/oauth/authorize?client_id=...`）
3. 在「文章 / posts」集合新增或編輯
4. 儲存 → Decap 以 editorial workflow 開 PR → 合併後 `deploy.yml` 自動部署

### C. 手動寫文（不需 CMS）
直接在 `src/content/posts/` 新增 `.md`（frontmatter 含 title/date/category/tags/source），
`git push` 到 `main` 即觸發自動部署。

### D. 部署
- 任何推送到 `main` → GitHub Actions `deploy.yml` → `astro build` → Cloudflare Pages。
- 未推送前不會上線；可用 `npm run preview` 本地預覽 build 結果。

## 快速連結
- 專案主頁：[[01-Personal Website]]
- 重建計畫：[[網站重建計畫 2026]]
- RSS 管線：[[RSS 聚合管線-行動流程]]
- 踩坑紀錄：[[04-踩坑紀錄]]

## 處理日誌
- 2026-09-06：螢幕小方框 Preview 第一階段完成 — 頂部 brand 與四個常駐文字卡片已隱藏；新增 icon-only monitor hotspots、底部 controls、共享 HTML popover 與 scene-relative SVG guide。Preview state 已與 global scene/window command bus 解耦，URL、dialog、星空、玩偶與披風不受 hover/tap 影響。驗證：119 unit PASS、54 E2E PASS／28 expected skip、contracts PASS、artifact build 860 pages、三組 reviewer 最終 0 Critical／0 Important。`npm run verify` 最後仍被既有 public projection source drift 阻擋，未越權同步。下一步只做 localhost 人工構圖確認；實際連結 deferred。
- 2026-09-06：Responsive 假通過修正 — 找到 660px fine-pointer 窄桌機同時混用 Desktop CSS、Mobile React modal 與 Mobile foreground 的根因。CSS、React `matchMedia`、拖曳／resize 判斷、`<picture>` source 與 unit fixture 已統一成同一 capability query；新增 660px fine/coarse runtime 回歸。Fresh evidence：100 unit PASS、42 E2E PASS／20 expected skip、contracts PASS、860 pages build、reviewer 0 findings。披風尚未實作，下一步先做 Desktop／Mobile 真實 Alpha 靜態預覽。
- 2026-09-06：Cozy Galaxy 現況更新 — 房間清晰度、window aperture、computer foreground 景深、流星固定右上→左下與左側細頭已完成自動驗證；目前進入玩偶披風微動畫設計。使用者確認 Desktop／Tablet／Mobile 一起做；既有 `.scarf-tail` 僅為漸層，後續改接真實披風 Alpha 三段 rig。Public projection 仍有 `trading-automation.updatedAt` drift，未在本視覺任務中越權同步。
- 2026-08-27：建立 Dashboard，去重代辦；確認 #1 缺口為 config.yml 缺 `auth: github` + `client_id`。
- 2026-08-27：#1 補上 config.yml 的 `auth: github` + `client_id` 佔位；剩餘需使用者在 GitHub 註冊 OAuth App 並填入真實 client_id（外部操作，我未擅自執行）。
- 2026-08-27：#3 調查 — `/protected/resume`、`/protected/vlog` 已存在但**目前未受 Cloudflare Access 保護**（僅佔位文字）；本地無 Cloudflare 憑證，已將手動設定步驟寫入 Dashboard，待使用者在 Cloudflare 後台執行。
- 2026-08-27：#3 **實測翻案** — 線上探測證實 Access 已生效（/protected/resume 回 302 登入挑戰，App 允許 isitoled@gmail.com via GitHub IdP）。原「待完成」為過期狀態，標記完成；當初「頁面公開」的判斷因未實測線上而錯誤。
- 2026-08-27：#4 調查 — `steep-glitter-0952` 為孤立舊站 Worker：無 zone route、DNS 無指向、repo 現役程式碼無引用（僅 封存/ 歷史文件提及）；workers.dev 仍 HTTP 200。停用 = 刪除 script（不可逆），待使用者確認。
- 2026-08-27：#4 執行 — 使用者確認後透過 Cloudflare API 刪除 steep-glitter-0952 script（success=True），剩 isitoled / red-mode-ea77。標記完成。
- 2026-08-27：#5 調查 — DigitalPlat FreeDomain 續簽以手動後台為主（dash.domain.digitalplat.org），API 續簽 endpoint 不公開（需從 Dashboard 取得）；FreeDomain 通常僅到期前 ~30 天開放續簽。距 2026-11-12 還 2.5 個月，過早續會浪費天數/被拒，故文件化 SOP + 設追蹤（建議動作日 ~2026-10-13），暫不續。DIGITALPLAT_API_KEY 已確認可取。
- 2026-08-27：#6 評估 — Reddit 伺服器端 403 早已由「改用 RSSHub 36Kr 源」緩解（feeds 現無 Reddit；主因 GitHub Actions IP 被 Reddit 標 bot）。若要真 Reddit 內容的替代方案：Reddit OAuth API（需憑證）或 RSSHub/Redlib 實例。待使用者決定。
- 2026-08-27：#7 調查 — 完整履歷目前 100% 私人（/protected/resume 經 Cloudflare Access，僅 isitoled@gmail.com）；公開站只有文章（public-notes.md 哲學：履歷=壓縮結果、網站=解壓脈絡）。建議公開「摘要版履歷頁」、完整版留 Access，待使用者決定是否做。
- 2026-08-27：#8 實作 — 首頁新增「工作台」區塊 + 3 卡片滑動面板（grid-template-rows 0fr→1fr 動畫），`astro build` 35 頁通過。週報 / 經驗沉澱面板內容待使用者填。
- 2026-08-27：#1 填入 client_id — 使用者提供 GitHub OAuth App client_id（`Ov23li...`），填入 `public/admin/config.yml` 並移除 TODO 佔位；`astro build` 通過。#2 解鎖，待 push 後於 live `/admin/` 實測登入。
- 2026-08-27：push 上線 — 先 `git pull --rebase`（遠端有 46 個 `📡 RSS 聚合` commit，本地 22 commit 無衝突接在其後），`git push origin main` 成功（`a3faa74..a7ef8f6`）；GitHub Actions 觸發 Cloudflare Pages 部署 #8 工作台 + #1 OAuth 設定。
- 2026-08-27：#2/#1 Playwright 實測 — `#8` 工作台已上線 ✅；`/admin/` 修好 `#root` 與 script 位置後 Decap 正常掛載（0 console error，「Login with GitHub」按鈕出現）。**但點擊後導向 `api.netlify.com/auth?provider=github&site_id=ethanyang.dpdns.org&scope=repo` → 404**。
- 2026-08-27：#1 **根因定案** — Decap 源碼 `Login with GitHub` 的 `handleLogin` 永遠用 `gR`（Netlify 閘道 `api.netlify.com/auth`），不讀 `client_id`；官方文件確認 `auth: github` 即為 Netlify 閘道，非 Netlify 託管站已失效。自訂 GitHub OAuth App 需自行架設 **External OAuth Client proxy** 並把 `auth` 指向它。**#1 未完成，被 proxy 需求阻擋**；`Ov23li...` client_id 已建好待用。
- 2026-08-27：路線決策 — 使用者選 **B（放棄 Decap，改手動寫文 #C）**。已從 repo `git rm -r public/admin/` 並改 index.astro 工作台文字；`astro build` 858 頁通過。Decap 相關 OAuth App（client_id `Ov23li...`）保留待用。
- 2026-08-27：清理多餘部署盤點 — Cloudflare 帳號下剩 2 個 Worker：`isitoled`（2025-10-27，未修改的預設 "Hello World" 範本，**明顯冗餘**）、`red-mode-ea77`（2025-01-11，為 proxy/VPN 訂閱 Worker：`cloudflare:sockets` + userID/proxyIP/subconverter，**功能性工具，非網站產物**）。Pages 專案：personal-website（現役）、lunatv / moontv（其他個人專案，非顯然冗餘）。待使用者確認是否刪除 `isitoled`（及 `red-mode-ea77`）。
- 2026-08-27：清理執行 — ① Decap 移除已 push 上線（`8481c56..80058ad`，GitHub Actions 觸發 Cloudflare Pages 部署，live `/admin/` 移除）。② Cloudflare Worker `isitoled`（預設範本）與 `red-mode-ea77`（proxy Worker）皆經 API 刪除成功（HTTP 200, success:true），帳號下 Workers 清為 0。Pages `lunatv`/`moontv` 與 DNS zone 保留。
- 2026-08-27：清理驗證 — 新部署 `3a70b0e` 的 preview（`cc5252e2`）`/admin/` 與 `/admin/index.html` 皆 404，首頁含新文字「已決議放棄」→ **origin 已乾淨**。但 live `ethanyang.dpdns.org/admin/` 與 `/admin/config.yml` 仍回 200 舊 Decap 頁（回應帶 `cf-cache-status: DYNAMIC` + `cache-control: public, s-maxage=604800`，即 Cloudflare edge 對**已刪除**檔案的殘留快取，長達 7 天）。cache-buster（`?v=1`）回 404 證實 origin 已乾淨，舊值純為 edge 快取。
- 2026-08-27：清快取嘗試 — Keychain `cloudflare` token 為 **DigitalPlat 代管合作夥伴 token**：僅含 `Zone:Cache Purge` 的 **Individual Files（清除）** 權限，下拉**鎖死無 Purge All**；且該 zone 在 dashboard **無 Caching UI**。API `purge_cache` `files` 可清 `/admin/index.html`（已轉 404），但 `/admin/`、`/admin/config.yml` 因被 Cache Rule（Cache Everything）以非預設 cache-key 快取，`files` purge 匹配不到 → 清不掉。三條強制清除路徑全擋（Purge All 無權限 / 無 UI / files 清不掉）。
- 2026-08-27：殘留處置決議 — **等 ≤7 天自然過期（s-maxage=604800）**：origin 已乾淨，TTL 一到自動轉 404，零風險零操作。
- 2026-08-27：架構根因（數位平台路徑 B 調查）— `*.dpdns.org` 經 Cloudflare for SaaS 以 **custom host** 形式掛在 **DigitalPlat 的 Cloudflare zone** 下；DigitalPlat 官方文件確認其僅做網域註冊/NS 委派，**不提供任何 CDN/快取管理 UI**。使用者的 isitoled Cloudflare 帳號只拿到受限 custom-host 權限（解釋了 token 下拉僅「個別檔案」、dashboard 無 Caching UI）。快取實際活在 DigitalPlat 的 zone，使用者端既無 UI 也無 Purge All 權限；DigitalPlat 後台亦無清除快取入口。**三條主動清除路徑（Purge All / Caching UI / files purge）全滅**，確認只能等 TTL 過期。殘留期間風險極低（config.yml 僅暴露公開 GitHub client_id，且已無 Decap 後端，`/admin/` 實際無法載入內容）。待使用者說「幫我複查」時用 `curl -I` 確認是否已轉 404。另：聯絡 DigitalPlat 支援請其清快取為長期備選（不保證可行）。
- 2026-08-27：#7 實作公開摘要履歷頁 — 新建 `src/pages/resume.astro`（去機密摘要：隱藏電話/客戶名/量化細節，保留職稱/時間/雇主/技能/學歷/摘要；email 經使用者確認保留），Topbar「履歷」與首頁工作台卡片改指向 `/resume`，頁尾保留「查看完整履歷 →」連回 `/protected/resume`（Access）。`astro build` 859 頁通過並驗證無電話外洩。使用者選「先不推，僅本地保留」。
- 2026-08-27：#1 收尾 — Decap 已放棄，原為其建的 GitHub OAuth App client_id `Ov23liWBSrm6U8VNv6Zi` 成為孤兒；因無 client_secret 且 PAT 無法刪 App，需使用者於 GitHub UI（Settings → Developer settings → OAuth Apps）手動刪除。待使用者執行後標 #1 完全收尾。
- 2026-08-27：#1 完全收尾 — 使用者於 GitHub UI 刪除孤兒 OAuth App client_id `Ov23liWBSrm6U8VNv6Zi`，Decap 相關清理全數完成（源碼移除 + OAuth App 註銷）。
- 2026-08-27：方向轉向網站樣式優化。查 `dembrandt/dembrandt-skills`：本地 `Agent-Skills` 無此 skill；該 repo 為 GitHub 上 MIT 授權的開源 Agent Skills 集合（~40 個 UX/design-system 技能，2026-05 仍有更新）。評估是否安裝導入以輔助樣式工作。本機已有 `website-analyze` skill 可做設計系統分析。
- 2026-08-27：#9 安裝完成 — `git clone` 至 `Agent-Skills/dembrandt-skills`（canonical 正本），41 個子技能隨現有 symlink `~/.config/opencode/skills → Agent-Skills` 自動被 OpenCode 發現（無平行正本：opencode 那份與 Agent-Skills 同源，inode 相同）。重疊比對：`extract-design` 與本地 `website-analyze` 功能重疊（前者需 dembrandt MCP 引擎），其餘為互補 UX 知識。MCP 引擎未接，知識類技能已可直接用。
- 2026-08-27：#9 dembrandt MCP 引擎已接 — `opencode.jsonc` 新增 `mcpServers.dembrandt`（本地 stdio：`npx -y --package dembrandt dembrandt-mcp`）。引擎經 `npx` 安裝 + Chromium 預載（93.5 MiB）成功；實測 `dembrandt https://ethanyang.dpdns.org` 擷取成功：顏色 9（#11110f/#f3f0e8/#76a7bd/#d4a34b/#8f897b/#b9b3a5/#37372f/#88b56b/#c46f5a）、字體 19、間距 12、圓角 4、按鈕 2 變體、連結 3 樣式、motion 1 時長 2 easing，與 global.css 主題一致；Cloudflare 未擋（內建 stealth）。MCP 工具需重啟 OpenCode 才載入；CLI 現已可直接用。
- 2026-08-27：#9 MCP 配置修正 — 原誤用 Claude Code 格式 `mcpServers`（opencode.jsonc 報 "Unrecognized key: mcpServers" 導致整份 config 失效、MCP 完全未載入）。修正為 OpenCode 正確格式：頂層 `mcp.<name>` + `type:"local"` + `command` 陣列。修正後 `opencode mcp list` 顯示 dembrandt ✓ connected（另原有 playwright MCP 亦在）。需再次重啟 OpenCode 才把 MCP 工具注入對話（本次 "go" 的 session 啟動時 config 仍無效）。
- 2026-08-27：#9 擷取 + 審計完成 — dembrandt CLI 擷取本站 8 頁 + dark mode，產出 `design-system/tokens.json`、`theme.css`、`output/.../DESIGN.md`。核證：① `#045ede` 不在 src（來自 TradingView iframe，非本站問題）；② 本站確認刻意深色單模式（無 light）；③ 語意色對 `#11110f` 對比度 text 16.6 / muted 9 / soft 5.4 / amber 8.2 全過 WCAG AA，不須改對比。審計存 `design-system/#9-design-audit.md`，列出 A focus-visible / B hover 抬升統一 / C radius 一致性 / D light mode 決策 / E 字型 scale 對齊。
- 2026-08-27：#9 E 盤點完成 — 使用者選「先盤點字型再動」。grep 全 src：`text-[…]`/inline `font-size` 均無命中，所有標題/正文皆用 `text-*` token 工具類，與 `global.css` scale 完全對齊；dembrandt 觀察的 52.5px/21px 為 computed 量測誤差。結論：E 無修改清單，字型已對齊。剩 A/B/C 待確認、D 待決策。
- 2026-08-27：#9 實作完成（A+B+C+D2）— A `global.css` 加 `:focus-visible` accent ring；B 定義 `--shadow-card` token（dark 0.3 / light 0.12）並全站可點卡片補 `hover:shadow-card`（PostCard 改用 token、index 資料卡/workbench 卡補齊）；C 2 處裸 `rounded`→`rounded-sm`（PostCard:44、articles/[slug]:61）；D2 light mode：`global.css` 加 `[data-theme="light"]` 覆寫全部語意 token + Topbar `#theme-toggle` 鈕 + BaseLayout 防 FOUC 腳本。`astro build` 通過（859 頁）＋ Playwright 驗證 dark/light 切換與 localStorage 持久化正確（light bodyBg #f4f1e9、card #fff、line #ddd6c7）。未提交（待使用者確認是否 push）。附註：首頁 VolumeChart 報 `lightweight-charts` module 解析錯誤，屬預存非 #9 範圍問題。
- 2026-08-27：VolumeChart 修復 — 根因 `<script is:inline>` + `import('lightweight-charts')` 不被 Vite 打包，瀏覽器收到裸 specifier 無法解析；且 v5 API 已改（`addCandlestickSeries` 不存在）。修法：移除 `is:inline`（改打包腳本）、靜態 `import { createChart, CandlestickSeries, HistogramSeries }`、改用 v5 `chart.addSeries(CandlestickSeries/HistogramSeries, ...)`、資料經 `data-data` 屬性傳入。驗證：`astro build` 通過 + Playwright 首頁 console 0 error、`.trading-chart` 內出現 canvas（圖表初始化成功）。dembrandt 生成物（design-system/extract.err、theme.css、tokens.json、output/）已移出 repo。

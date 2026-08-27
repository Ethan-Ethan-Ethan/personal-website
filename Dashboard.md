---
type: dashboard
project: personal-website
status: active
created: 2026-08-27
updated: 2026-08-27
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
| 框架 | Astro 7 + Tailwind v4 + Decap CMS + GitHub Actions + Cloudflare Pages |
| Repo | `Ethan-Ethan-Ethan/personal-website` |
| 部署觸發 | `git push` → `main` → `.github/workflows/deploy.yml` 自動部署 |
| RSS 排程 | `.github/workflows/rss-aggregate.yml` 每日 UTC 02:00 |
| 整體狀態 | Phase 1-6 完成；剩餘見下方代辦 |

## 代辦清單（正本，已去重）

> 來源去重：`01-Personal Website.md` 與 `網站重建計畫 2026.md` 原本各寫一份重複清單，此處為唯一正本。

- [ ] **#1 Decap CMS GitHub OAuth 驗證** — ⚠️ 2026-08-27 經 Playwright 實測：Decap 已能掛載（修好 `index.html` script 位置 + `#root`），但 `auth: github` 走的是 Decap 舊的 **Netlify 閘道**（`api.netlify.com/auth` → 404，已停用），**我們設的 `client_id` 完全沒被用到**（登入網址無 `client_id` 參數）。非 Netlify 託管站要用自訂 GitHub OAuth App，必須自行架設 **External OAuth Client proxy**（Decap 官方列出的社群方案，含專給 Cloudflare Pages 的），再把 `auth` 指向它。**#1 未完成，被 proxy 需求阻擋。** GitHub OAuth App（client_id `Ov23li...`）已建好待用。
- [ ] **#2 測試「瀏覽器寫文章 → commit → 自動部署」** — 依賴 #1 OAuth 完成
- [x] **#3 Cloudflare Access 設定（`/protected/*` 路由保護）** — ✅ 2026-08-27 實測生效：未帶憑證訪問 /protected/resume 回傳 302 導向 cloudflareaccess.com 登入；App「Ethan Personal Website Protected」允許 isitoled@gmail.com（GitHub IdP）。原計畫書「待完成」為過期狀態。
- [x] **#4 停用舊 Workers 部署（`steep-glitter-0952`）** — ✅ 2026-08-27 已透過 Cloudflare API 刪除 script（剩 isitoled / red-mode-ea77，非目標）。舊站徹底停用。
- [ ] **#5 網域續簽** — 期限 **2026-11-12**；SOP 與追蹤已建（見專區）。續簽窗口約 2026-10-13 起，**現過早不續，待窗口內執行**
- [ ] **#6 Reddit 替代 RSS 源評估** — 已評估：Reddit 伺服器端 403 早已由「改用 RSSHub 36Kr 源」緩解（feeds 現無 Reddit，見 踩坑紀錄/Worklog）。若要真 Reddit 內容，替代方案：①Reddit OAuth API（需建 Reddit app + 憑證）②穩定 RSSHub/Redlib 實例（公共實例不穩）。待你決定是否要真 Reddit。
- [ ] **#7 檢查履歷公開 / 私人邊界** — 現狀：完整履歷 100% 私人（`/protected/resume` 經 Cloudflare Access，僅 isitoled@gmail.com）；公開站只有文章（哲學：履歷=壓縮結果、網站=解壓脈絡）。建議：公開「摘要版履歷頁」（職稱/時間/技能/總結，不含客戶機密），完整版留 Access。待你決定是否做公開頁。
- [x] **#8 工作台卡片滑動面板功能** — ✅ 2026-08-27 實作：首頁新增「工作台」區塊，3 卡片（待辦健康度 / 週報 / 經驗沉澱）點擊後用 `grid-template-rows: 0fr→1fr` 滑出下方面板；`astro build` 35 頁通過。週報 / 經驗沉澱面板內容待填。

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

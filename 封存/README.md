---
project: 個人網站
status: active
created: 2026-06-15
updated: 2026-07-18
type: note
---

# 個人網站

## 目的

建立以心得、報告、觀點為主體的個人網站，而不是只呈現履歷。

## 目前線上狀態

- 免費網域：`ethanyang.dpdns.org`
- 正式網址：`https://ethanyang.dpdns.org/`
- Cloudflare Worker 網址：`https://steep-glitter-0952.isitoled.workers.dev/`
- Cloudflare Worker：`steep-glitter-0952`
- 狀態：已上線，`curl -I https://ethanyang.dpdns.org` 回 `HTTP/2 200`

## 專案進度

### 已完成

- 首頁第二版排版定稿：左側工作台摘要、右側 TradingView K 線圖（預設 `TAIFEX:TMF1!`）與 TMF/TXF/MXF 清單；工作台卡片點擊後才顯示下方對應面板；右上固定履歷/Vlog 入口。
- 建立個人網站專案資料夾與網站原始檔
- 網站首頁改成以心得、報告、觀點為主，不以履歷為主
- 首頁已改成 Dashboard 風格，並加入「Dashboard / 日常心得」切換
- 右上導覽保留履歷、Vlog
- 原本首頁下方的大型履歷 / Vlog 入口卡片已移除，改為右上入口點開後展開
- 履歷與 Vlog 入口已設暫時前端密碼
- 履歷入口已更新為完整職涯摘要：EMC、Power DC、硬體開發、FAE 約 17+ 年
- 履歷入口已補完整內容區塊：個人摘要、職涯時間線、核心能力、代表成果、學歷與證照、待補欄位
- 履歷內容已修正：FAE 客戶區域改為深圳與台灣；移除未確認泰國/越南/馬來西亞、RCA/8D 流程與未確認量化成果；成果改放 Dell Server、GPIB 自動化、EMC/PCB Layout 對策與專利方向待確認
- 履歷日期已修正：偉詮電子資深 FAE 期間為 `2020/10-2026/05`，不再標示「至今」
- 新增正式履歷 PDF 公開下載版：`website/assets/ethan-yang-resume.pdf`，含照片與詳細成果，不含手機與詳細地址
- Cloudflare Worker 部署完成
- `ethanyang.dpdns.org` 已加入 Cloudflare Zone
- DigitalPlat nameserver 已指向 Cloudflare
- Cloudflare Worker custom domain 已綁定 `ethanyang.dpdns.org`
- `wrangler.jsonc` 與 `.gitignore` 已建立
- `wrangler deploy --dry-run` 已驗證可讀取 `website/`
- Cloudflare token 權限已修正，`wrangler deploy` 已可正式部署
- `deploy/personal-site-starter.zip` 已重新打包為 Dashboard 版本

### 進行中

- 履歷公開版內容整理：網站版已補主要內容，仍待補 LinkedIn、TOEIC、成本節省金額、可到職週數；專利引用方式需正式確認
- 投遞用私密履歷：若需要手機、詳細地址或完整個資，應另產生本機私密 PDF，不放到網站 assets

### 待辦

- 決定是否建立 GitHub repo 並接 Cloudflare 自動部署
- 將履歷 / Vlog 的前端暫時密碼改成 Cloudflare Access 或其他正式保護方式
- 補 LinkedIn、TOEIC、可到職週數、3-5 個代表專案與一頁式履歷版本
- 持續補心得、報告、Vlog 內容

## 目錄

- `website/`：網站原始檔
- `deploy/`：手動上傳到 Cloudflare 的部署包
- `api/`：Cloudflare API / Wrangler 部署紀錄與 token 安全規則

## 與 Obsidian 的分工

- Documents 專案資料夾：放網站實體檔案、部署包、API / Wrangler 紀錄
- Obsidian 專案 MOC：放內容索引、素材分類、工作流程與知識整理
- Obsidian `reflections/`：預留放心得、報告、觀點文章草稿；目前尚未放入正式文章
- 同一份知識只保留一個正本：網站檔案以 Documents 為正本，內容索引以 Obsidian 為正本

## 目前網站規劃

- 首頁：左右雙欄 Dashboard；左側工作台摘要，右側 TradingView K 線圖與觀察清單
- 工作台卡片：點擊後滑動到下方並顯示對應面板（待辦健康度、週報新聞、經驗沉澱等）
- 右上導覽：固定只保留履歷、Vlog，解鎖後才顯示履歷 Dashboard
- 履歷暫時密碼：`123456`
- Vlog 暫時密碼：`654321`

> 暫時密碼是前端遮擋，不是真正安全機制。正式公開前若仍需保護，改用 Cloudflare Access。

## 手動更新流程

1. 修改 `website/index.html`
2. 重新打包成 `deploy/personal-site-starter.zip`
3. 到 Cloudflare Worker `steep-glitter-0952`
4. 點「新部署」
5. 上傳 zip
6. 按「部署」
7. 開啟線上網址驗證

## API 更新流程狀態

已建立 `wrangler.jsonc`，可用以下指令做 dry-run：

```bash
npx --yes wrangler deploy --dry-run
```

正式部署已可使用 Keychain 內 Cloudflare token 執行：

```bash
npx --yes wrangler deploy
```

---
type: note
status: archived
created: 2026-06-15
updated: 2026-07-18
tags:
  - project/personal-website
  - tool/cloudflare
  - type/archived
---

> **已封存**：此文件記錄第一代 Workers 部署的 API Token 設定與 Wrangler 指令。2026-07-12 已改用 Astro 7 + Cloudflare Pages，認證方式改為 wrangler OAuth。新流程請參考 [[網站重建計畫 2026]]。

# Cloudflare API 與 Wrangler 紀錄

## 目前狀態

本次部署已可使用 Wrangler 自動部署；Cloudflare Dashboard 手動上傳 zip 保留作備援方式。

### 2026-06-17 部署紀錄

- Wrangler 版本：4.101.0
- 部署成功，Version ID: `156630f7-2c43-46fc-b20c-48c5a8dce298`
- 正式網址：`https://ethanyang.dpdns.org/`
- 部署內容：首頁最新版（TradingView BTC/ETH/微小台連動、服務動態、相關連結、經驗沉澱原子筆記×MOC）

### 2026-06-16 部署紀錄

- Cloudflare API Token 權限修正後，Wrangler 部署成功
- Version ID: `d2558bdc-e8df-4407-b61f-a7c1ec6039bd`

目前 API 統一管理入口：

```text
/Users/ethan/Documents/api-keys/
```

管理方式：

- API key/token 不寫入專案、筆記或聊天
- 實際密鑰存放在 macOS Keychain
- 專案只記錄讀取方式與環境變數名稱
- Cloudflare / DigitalPlat API 由 `~/Documents/api-keys/keys.py` 載入

## Wrangler 設定狀態

已建立：

```text
../wrangler.jsonc
../.gitignore
```

`wrangler.jsonc` 目前設定：

- Worker：`steep-glitter-0952`
- Account ID：已寫入設定檔
- Assets：`./website`
- Compatibility date：`2026-06-15`

Dry-run 驗證成功：

```bash
npx --yes wrangler deploy --dry-run
```

結果：

- Wrangler 可讀取 `website/`
- 讀到 1 個 assets 檔案
- 沒有執行部署

正式部署測試：

```bash
env CLOUDFLARE_API_TOKEN="$(security find-generic-password -s cloudflare -w)" npx --yes wrangler deploy
```

結果：

- Cloudflare API 回 `Authentication error [code: 10000]`
- 判斷為 Cloudflare token 權限或 token 類型需要調整
- 專案設定檔本身已通過 dry-run

2026-06-16 重試結果：

- `keys.py` 已同時提供 `CLOUDFLARE_API_TOKEN`
- 使用 Keychain 內 `cloudflare` token 執行 `npx --yes wrangler deploy`
- 仍回 `Authentication error [code: 10000]`
- 目前判斷不是本機環境變數名稱問題，而是 Cloudflare token 權限、token 類型或該 token 可存取帳戶範圍需要調整

2026-06-16 權限修正後結果：

- 使用者於 Cloudflare API Token 頁面補齊 Workers 部署所需權限。
- 使用 Keychain 內 `cloudflare` token 執行 `npx --yes wrangler deploy` 成功。
- Wrangler 成功上傳 `website/index.html` 到 Worker `steep-glitter-0952`。
- Current Version ID：`d2558bdc-e8df-4407-b61f-a7c1ec6039bd`
- 正式網址 `https://ethanyang.dpdns.org/` 驗證為 `HTTP/2 200`，內容包含新版 Dashboard / 日常心得 / 履歷 / Vlog。

## 嘗試過的 Wrangler 指令

```bash
npx --yes wrangler pages deploy work/personal-site-starter --project-name ethanyang
```

```bash
npx --yes wrangler deploy work/personal-site-starter --name steep-glitter-0952 --assets work/personal-site-starter
```

結果：

- Wrangler 可執行
- 但要求設定 `CLOUDFLARE_API_TOKEN`

## API Token 安全規則

- 不把 Cloudflare API Token 貼到聊天
- 不把 token 寫入筆記
- 不提交 token 到 git
- 只透過 `~/Documents/api-keys/keys.py` 從 Keychain 載入
- Cloudflare token 已可用於 Wrangler 部署；仍建議維持最小權限
- token 建議只給 Workers 部署所需權限

## Cloudflare Token 權限

目前 Keychain 內 `cloudflare` token 已可完成 Wrangler 部署。若未來重建 token，建議確認 token 是 Cloudflare API Token，不是 Global API Key。

最小權限建議：

- Account → Workers Scripts → Edit
- Account → Account Settings → Read
- User → User Details → Read

若未來要透過 API 管 DNS，再另行補：

- Zone → Zone → Read
- Zone → DNS → Edit

## 自動部署方式

### 方式 A：Keychain helper 載入環境變數

```bash
python3 - <<'PY'
import sys
sys.path.insert(0, "/Users/ethan/Documents/api-keys")
from keys import load_keyring
load_keyring()
PY
```

Wrangler 需要的環境變數名稱通常是：

```text
CLOUDFLARE_API_TOKEN
```

若 helper 目前輸出的是 `CLOUDFLARE_API_KEY`，需在 `keys.py` 內確認是否要新增或改名為 `CLOUDFLARE_API_TOKEN`，避免 Wrangler 找不到。

```bash
npx wrangler deploy website --name steep-glitter-0952 --assets website
```

### 方式 B：`.env` 檔

可建立 `.env`，但必須加入 `.gitignore`，不要提交。

### 方式 C：GitHub + Cloudflare 自動部署

將網站檔案放到 GitHub repo，Cloudflare 連接 repo 後自動部署。

優點：

- 不需要手動上傳 zip
- 每次 commit 可追蹤
- 適合長期維護

風險：

- GitHub repo 若公開，不能放私密資料
- 仍需處理履歷/Vlog 的正式保護方式

## 目前建議

短期：

- 已完成 `ethanyang.dpdns.org` 綁定
- 若只做少量改版，可手動上傳 zip 作為備援
- 改版頻繁時，使用 Keychain + Wrangler 部署

中期：

- 建立 GitHub repo
- 接 Cloudflare 自動部署
- 或建立本機 deploy script，從 Keychain 載入 token 後執行 Wrangler

長期：

- 用 Cloudflare Access 取代前端密碼

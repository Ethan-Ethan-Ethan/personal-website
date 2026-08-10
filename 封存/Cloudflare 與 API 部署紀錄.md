---
type: note
status: archived
created: 2026-06-15
updated: 2026-07-12
tags:
  - project/personal-website
  - tool/cloudflare
  - workflow/deploy
  - type/archived
---

> **已封存**：此文件記錄第一代 Workers 靜態部署流程。2026-07-12 已全面遷移至 Astro 7 + Cloudflare Pages，部署方式改為 git push 自動觸發。新流程請參考 [[網站重建計畫 2026]] 與 [[RSS 聚合管線-行動流程]]。

# Cloudflare 與 API 部署紀錄

## 現況

- Cloudflare 帳號已登入
- 已建立 Workers 靜態資產部署
- 線上網址：`https://steep-glitter-0952.isitoled.workers.dev/`
- 網站來源檔：`index.html`
- 更新方式：手動上傳 `personal-site-starter.zip`

## 為什麼目前用手動上傳

本次嘗試用 Chrome extension 自動上傳 zip 時，被 Chrome extension 的檔案權限擋住。

處理方式：

- 產生新版 zip
- 在 Cloudflare Workers 新部署頁手動拖入 zip
- 按「部署」

若要讓 Codex 代為上傳檔案，需要在 Chrome extension 設定中允許存取本機檔案：

1. 開啟 `chrome://extensions`
2. 找到 Codex extension
3. 點 Details
4. 開啟「Allow access to file URLs」

## Wrangler / API Token 紀錄

曾嘗試使用 Wrangler CLI：

```bash
npx --yes wrangler pages deploy work/personal-site-starter --project-name ethanyang
```

以及：

```bash
npx --yes wrangler deploy work/personal-site-starter --name steep-glitter-0952 --assets work/personal-site-starter
```

結果：

- Wrangler 可執行
- 但在非互動環境需要 `CLOUDFLARE_API_TOKEN`
- 沒有 token 時無法自動部署

## API Token 注意事項

- 不要把 Cloudflare API Token 貼到聊天中
- 若要使用 CLI 自動部署，應建立最小權限 token
- Token 應放在本機環境變數或安全的 secret 管理中
- 建議權限只給這個帳號與 Workers/Pages 部署所需範圍

建議命名：

```text
CLOUDFLARE_API_TOKEN
```

使用方式概念：

```bash
CLOUDFLARE_API_TOKEN=... npx wrangler deploy ...
```

> 實作時不要把 token 寫進筆記或 repo。應使用 shell 環境變數、`.env`（不提交）、或系統 secret manager。

## 後續部署 SOP

### 手動部署

1. 修改 `work/personal-site-starter/index.html`
2. 重新打包：

```bash
cd /Users/ethan/Documents/Codex/2026-06-15/v-log/work/personal-site-starter
zip -r ../../outputs/personal-site-starter.zip index.html
```

3. 到 Cloudflare Worker `steep-glitter-0952`
4. 點「新部署」
5. 上傳新版 `personal-site-starter.zip`
6. 按「部署」
7. 開啟 `https://steep-glitter-0952.isitoled.workers.dev/` 驗證

### 自動部署候選

未來可以考慮：

- Cloudflare Wrangler + API Token
- GitHub repo + Cloudflare 自動部署
- Cloudflare Pages 專案改為 Git 整合

## 與網域綁定

目前已申請：

```text
ethanyang.dpdns.org
```

尚未完成：

- 將 `ethanyang.dpdns.org` 指向 Cloudflare Worker
- 確認 DigitalPlat 名稱伺服器 / DNS 設定方式
- 確認 Cloudflare 自訂網域是否接受此免費網域

## 風險

- 前端密碼不是安全機制
- DNS 設定錯誤會造成網域無法開啟
- API Token 權限過大會有帳號風險
- 手動部署容易忘記同步本機檔與線上版本

## 相關

- [[個人網站建置工作流程]]
- [[Personal Website MOC]]

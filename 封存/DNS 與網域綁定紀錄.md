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

> **已封存**：此文件記錄第一代 Workers 的 DNS 設定。2026-07-12 已將 CNAME 目標從 Workers 改為 Cloudflare Pages（`personal-website-bvk.pages.dev`），Nameserver 與續期提醒維持不變。最新設定請參考 [[網站重建計畫 2026]]。


# DNS 與網域綁定紀錄

## 目前狀態

已完成 `ethanyang.dpdns.org` 到 Cloudflare Worker 的綁定。

- 網域：`ethanyang.dpdns.org`
- Worker 服務：`steep-glitter-0952`
- Worker 預設網址：`https://steep-glitter-0952.isitoled.workers.dev/`
- 自訂網域：`https://ethanyang.dpdns.org/`
- 驗證結果：`HTTP/2 200`
- 驗證日期：2026-06-16
- 最新部署確認：Cloudflare Dashboard 的 `steep-glitter-0952 / production` 部署位置正確，正式網址已回應新版 Dashboard 首頁

## Nameserver

DigitalPlat 目前指向 Cloudflare nameserver：

```text
sonia.ns.cloudflare.com
camilo.ns.cloudflare.com
```

## Cloudflare Worker Custom Domain

Cloudflare Worker 的「網域與路由」已新增：

```text
ethanyang.dpdns.org
```

子網域欄位留空，因此使用根網域。

## 驗證指令

```bash
dig NS ethanyang.dpdns.org +short
dig A ethanyang.dpdns.org +short
curl -I --max-time 20 https://ethanyang.dpdns.org
```

驗證時 A 記錄解析到 Cloudflare IP，HTTPS 回應 `HTTP/2 200`。

## 注意事項

- 若 Chrome 短時間出現 SSL 錯誤，通常是憑證或瀏覽器快取尚未更新；以 `curl -I` 與稍後重開瀏覽器驗證。
- DNS / SSL 傳播可能需要幾分鐘到數小時。
- 後續若重建 Worker 或改服務名稱，需重新確認 custom domain 是否仍指向正確 Worker。

## 免費域名續期提醒

來源筆記：Obsidian `website-deploy/注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！`

- `.dpdns.org` 免費域名需要每 180 天續期一次。
- 以 2026-06-15 註冊 / 啟用估算，下一次到期約為 2026-12-12。
- 已建立 Codex 提醒：2026-11-12 09:00，提醒登入 DigitalPlat Dashboard 檢查 `ethanyang.dpdns.org` 續期。
- automation id：`ethanyang-dpdns-org`

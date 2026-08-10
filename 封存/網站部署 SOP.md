---
type: reference
status: archived
created: 2026-06-18
updated: 2026-07-18
tags:
  - project/personal-website
  - workflow/deploy
  - type/archived
verification_status: verified
---

> **已封存**：此文件記錄第一代 Workers 的手動部署 SOP。2026-07-12 已全面改為 Cloudflare Pages 自動部署。新流程：`git push main` → Cloudflare Pages 自動偵測 → `astro build` → `dist/` 輸出 → 部署上線。無需手動 staging 或 Wrangler 指令。

# 網站部署 SOP

## 目的

固定個人網站的正式部署流程，避免把 `.wrangler`、`.DS_Store` 或其他本機暫存檔一起上傳。

## 部署前檢查

- 本機網站來源：`../website/`
- 正式網域：`https://ethanyang.dpdns.org/`
- Cloudflare Worker：`steep-glitter-0952`
- Cloudflare API Token：Keychain 服務名稱 `cloudflare`
- 受保護路徑：
  - `ethanyang.dpdns.org/protected/*`
  - `ethanyang.dpdns.org/assets/ethan-yang-resume.pdf`

## Clean Staging Deploy

每次部署都先建立乾淨 staging，只複製正式需要的檔案：

```bash
STAGE=$(mktemp -d /private/tmp/ethan-site-deploy-XXXXXX)
mkdir -p "$STAGE/articles" "$STAGE/assets" "$STAGE/protected"
cp "../website/index.html" "$STAGE/"
cp "../website/articles/"*.html "$STAGE/articles/"
cp "../website/assets/ethan-yang-resume.pdf" "$STAGE/assets/"
cp "../website/protected/"*.html "$STAGE/protected/"
TOKEN=$(security find-generic-password -s cloudflare -w)
CLOUDFLARE_API_TOKEN="$TOKEN" npx --yes wrangler deploy --name steep-glitter-0952 --compatibility-date 2026-06-18 --assets "$STAGE"
```

## 部署後驗證

```bash
curl -I https://ethanyang.dpdns.org/
curl -I https://ethanyang.dpdns.org/articles/
curl -I -L --max-redirs 0 https://ethanyang.dpdns.org/protected/resume.html
curl -I -L --max-redirs 0 https://ethanyang.dpdns.org/protected/vlog.html
curl -I -L --max-redirs 0 https://ethanyang.dpdns.org/assets/ethan-yang-resume.pdf
```

預期結果：

- 首頁：`200`
- `/articles/`：`200`
- `/protected/resume.html`：`302` 到 Cloudflare Access
- `/protected/vlog.html`：`302` 到 Cloudflare Access
- 履歷 PDF：`302` 到 Cloudflare Access

## 首頁內容檢查

```bash
curl -sS https://ethanyang.dpdns.org/ | rg "articles/|續期檢查|protected/resume.html|protected/vlog.html"
```

## Cloudflare Access 設定摘要

- Application：`Ethan Personal Website Protected`
- 驗證方式：Cloudflare One-time PIN
- 允許 email：`isitoled@gmail.com`
- 保護範圍：
  - `/protected/*`
  - `/assets/ethan-yang-resume.pdf`
- Session duration：`24h`

## 部署後同步

部署完成後同步更新：

- `~/Documents/memory.md`
- `04_Projects/Personal-Website/Personal Website MOC.md`
- `04_Projects/Personal-Website/個人網站建置工作流程.md`

## 相關

- [[個人網站建置工作流程]]
- [[Cloudflare 與 API 部署紀錄]]


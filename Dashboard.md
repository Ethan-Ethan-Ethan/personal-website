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

- [ ] **#1 Decap CMS GitHub OAuth 驗證** — `public/admin/config.yml` 缺 `auth: github` + `client_id`，需在 GitHub 註冊 OAuth App 後補設定（blocked / 待外部註冊）
- [ ] **#2 測試「瀏覽器寫文章 → commit → 自動部署」** — 依賴 #1 OAuth 完成
- [ ] **#3 Cloudflare Access 設定（`/protected/*` 路由保護）** — 待完成（外部 Cloudflare 操作）
- [ ] **#4 停用舊 Workers 部署（`steep-glitter-0952`）** — 待確認（外部 Cloudflare 操作）
- [ ] **#5 網域續簽** — 期限 **2026-11-12**（見下方專區）
- [ ] **#6 Reddit 替代 RSS 源評估** — 伺服器端 403，待評估
- [ ] **#7 檢查履歷公開 / 私人邊界** — 待處理
- [ ] **#8 工作台卡片滑動面板功能** — 點擊後滑動顯示對應面板（待辦健康度 / 週報 / 經驗沉澱）

## 網域續簽專區（#5）

| 項目 | 值 |
|---|---|
| 網域 | `ethanyang.dpdns.org` |
| 來源 | DigitalPlat FreeDomain（免費方案） |
| 續期方式 | 每 ~150 天**手動**續期 |
| 下次檢查日 | **2026-11-12** ⚠️ |
| 管理後台 | https://dash.domain.digitalplat.org （GitHub OAuth 登入） |

> 提醒：免費方案無自動續期，需在 2026-11-12 前手動登入續期，否則網域可能被釋出。

## 如何開啟與編輯網頁

### A. 本機預覽（開發）
```bash
cd ~/Documents/Obsidian\ Vault/04_Projects/個人網站
npm run dev          # 或 astro dev --background
# 預覽網址：http://localhost:4321
# 停止：astro dev stop ｜ 狀態：astro dev status ｜ 日誌：astro dev logs
```

### B. 透過 Decap CMS 瀏覽器編輯（目標流程，#1 完成後可用）
1. 開瀏覽器前往 `https://ethanyang.dpdns.org/admin/`
2. 點「Login with GitHub」授權（需先完成 #1 OAuth App 註冊）
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

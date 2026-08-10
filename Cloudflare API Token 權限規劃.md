---
type: reference
status: active
created: 2026-07-11
updated: 2026-07-18
tags:
  - reference/cloudflare
  - reference/devops
  - reference/lessons-learned
verification_status: partial
---

# Cloudflare API Token 權限規劃

## 問題

2026-07-11 部署個人網站到 Cloudflare Pages 時，發現原 API Token 只有 Workers 權限，無法操作 Pages。

## 教訓

建立 Cloudflare API Token 時，應一次性涵蓋所有可能需要的權限，避免事後補。

## 未來建立 Token 的完整權限清單

| 類別 | 權限 | 用途 |
|------|------|------|
| **Account** | Cloudflare Workers Scripts → Edit | 部署 Workers |
| **Account** | Cloudflare Pages → Edit | 部署 Pages 專案 |
| **Account** | Cloudflare D1 → Edit | 資料庫（如需要） |
| **Account** | Cloudflare KV → Edit | KV 存儲（如需要） |
| **Zone** | Zone → Read | 讀取網域資訊 |
| **Zone** | DNS → Edit | DNS 記錄管理 |
| **User** | Memberships → Read | 讀取帳號關係 |

## 預防措施

1. **部署前檢查**：開始部署任務前，先跑 `CLOUDFLARE_API_TOKEN=xxx wrangler pages deploy --dry-run` 確認權限
2. **Token 建立模板**：新專案建立 Token 時，參考上方清單一次性設定
3. **OAuth 替代方案**：開發階段可用 `wrangler login`（OAuth），權限較廣；CI/CD 再用 API Token
4. **文件化**：把 Token 需要的權限寫在專案 README 或 CLAUDE.md

## Token 存放

- macOS Keychain：服務名稱 `cloudflare`
- 讀取指令：`security find-generic-password -s cloudflare -w`
- 更新位置：https://dash.cloudflare.com/profile/api-tokens

## 相關

- [[04_Projects/Personal-Website/Personal Website MOC]]
- [[04_Projects/Personal-Website/網站重建計畫 2026]]

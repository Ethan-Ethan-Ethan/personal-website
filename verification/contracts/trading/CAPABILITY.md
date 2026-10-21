# 湖面交易自動化（TradingPanel）

`derived_from: src/features/workspace/core/trading-snapshot.json` · `scripts/run-trading-automation.mjs`

## 資料源

| 區塊 | 來源 | 更新方式 |
|------|------|----------|
| K 線 5m | TradingView embed | 開面板時由第三方行情更新 |
| 文字（偏向／摘要） | `trading-snapshot.json` | **本機**：投資交易寫入信箱 → `npm run trading:local-sync`（可選 launchd 每 5 分） |

**不使用 GitHub Actions 定時 job。**

### 本機信箱（投資交易 → 個人網站）

預設路徑（可用 `TRADING_SIGNAL_INBOX` 覆寫）：

`../投資交易/outputs/website-trading-signal.json`

範例見 `verification/fixtures/trading/website-trading-signal.example.json`。

投資交易 pipeline 在產生／清除方向時更新該 JSON；個人網站腳本合併進快照，**有變才寫檔**。

可選 `TRADING_LOCAL_DEPLOY=1`：快照變更後本機 `git commit` + `push origin main`（觸發既有 Cloudflare deploy）。

### launchd（可選）

```bash
./scripts/install-trading-launchd.sh        # 安裝每 5 分同步
./scripts/install-trading-launchd.sh --uninstall
```

## 手動單筆事件

`npm run sync:trading -- --event signal.json`

## Oracle

- `trading-snapshot.test.ts`
- `TradingPanel.test.tsx`
- `verification/unit/read-local-trading-inbox.test.ts`

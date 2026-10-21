# 湖面交易自動化（TradingPanel）

`derived_from: src/features/workspace/core/trading-snapshot.json` · `scripts/run-trading-automation.mjs` · `.github/workflows/trading-snapshot.yml`

## 資料源

| 區塊 | 來源 | 更新方式 |
|------|------|----------|
| K 線 5m | TradingView embed | 開面板時由第三方行情更新 |
| 文字（偏向／摘要） | `trading-snapshot.json` | GitHub Actions 每 5 分鐘跑 `run-trading-automation.mjs`（Binance 5m K 線 → `evaluateBtc5m`）；**快照有變才 commit/push**，觸發既有 deploy；無方向 UI 顯示「當前無方向」 |

`evaluateBtc5m`（`scripts/lib/trading-signal-eval.mjs`）預設不回傳方向，待 MASA／力道框規則實作；手動事件仍可用 `npm run sync:trading -- --event …`。

## 事件格式

```json
{ "market": "btc", "bias": "偏多", "summary": "一句話", "signal_at": "2026-10-22T10:05:00+08:00" }
```

`bias` 為 `null` 或 `觀望`：清空方向與 summary，保留 `signal_at`（供「上次方向訊號」顯示），不更新 `_generated`。

## Oracle

- `trading-snapshot.test.ts`
- `TradingPanel.test.tsx`
- `verification/unit/trading-signal-eval.test.ts`

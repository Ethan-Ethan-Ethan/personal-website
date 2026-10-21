/**
 * BTC 5m 訊號評估（可擴充 MASA／力道框）。
 * 預設不產生方向訊號；僅在 evaluateBtc5m 內實作規則後才會回傳偏多／偏空。
 *
 * @typedef {{ open: number; high: number; low: number; close: number; openTimeMs: number; closeTimeMs: number }} Candle
 * @typedef {{ kind: 'none' }} NoneSignal
 * @typedef {{ kind: 'directional'; bias: '偏多'|'偏空'; summary: string; signal_at: string }} DirectionalSignal
 */

import { lastClosedCandle } from './fetch-btc-klines.mjs';

/**
 * @param {Candle[]} candles
 * @returns {NoneSignal | DirectionalSignal}
 */
export function evaluateBtc5m(candles) {
  const closed = lastClosedCandle(candles);
  if (!closed) return { kind: 'none' };

  // --- 擴充點：MASA／力道框／收盤突破等 ---
  // 範例（勿啟用）：若收盤較開盤 >0.4% 且為近 12 根最高收 → 偏多
  void closed;

  return { kind: 'none' };
}

/**
 * @param {NoneSignal | DirectionalSignal} signal
 */
export function signalToMarketEvent(signal) {
  if (signal.kind === 'directional') {
    return {
      bias: signal.bias,
      summary: signal.summary,
      signal_at: signal.signal_at,
    };
  }
  return { bias: null };
}

import { describe, expect, it } from 'vitest';
import { evaluateBtc5m, signalToMarketEvent } from '../../scripts/lib/trading-signal-eval.mjs';
import { lastClosedCandle } from '../../scripts/lib/fetch-btc-klines.mjs';

const candle = (closeTimeMs: number, close: number) => ({
  openTimeMs: closeTimeMs - 300_000,
  open: close - 10,
  high: close + 20,
  low: close - 20,
  close,
  closeTimeMs,
});

describe('trading-signal-eval', () => {
  it('defaults to no directional signal', () => {
    const candles = [candle(1_000_000, 100), candle(1_300_000, 101), candle(1_600_000, 102)];
    expect(evaluateBtc5m(candles)).toEqual({ kind: 'none' });
    expect(signalToMarketEvent({ kind: 'none' })).toEqual({ bias: null });
  });

  it('lastClosedCandle skips forming bar', () => {
    const candles = [candle(1_000_000, 100), candle(1_300_000, 101), candle(1_600_000, 102)];
    expect(lastClosedCandle(candles)?.closeTimeMs).toBe(1_300_000);
  });
});

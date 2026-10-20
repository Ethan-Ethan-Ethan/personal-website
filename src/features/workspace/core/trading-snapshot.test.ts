import { describe, expect, it } from 'vitest';
import { parseTradingSnapshot } from './trading-snapshot';
import snapshotDoc from './trading-snapshot.json';

describe('trading-snapshot', () => {
  it('parses committed snapshot', () => {
    const doc = parseTradingSnapshot(snapshotDoc);
    expect(doc).not.toBeNull();
    expect(doc!.markets.btc.symbol_tv).toContain('BTC');
    expect(doc!.markets.txf.pending).toBe(true);
  });

  it('rejects invalid bias', () => {
    const bad = {
      _generated: '2026-01-01T00:00:00+08:00',
      markets: {
        btc: { symbol_tv: 'X', bias: '做多', method_note: 'ok' },
        txf: { symbol_tv: 'Y', method_note: 'ok' },
      },
    };
    expect(parseTradingSnapshot(bad)).toBeNull();
  });
});

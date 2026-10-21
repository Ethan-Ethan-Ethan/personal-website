import { describe, expect, it } from 'vitest';
import { applyMarketSignalEvent, hasDirectionalSignal, parseTradingSnapshot } from './trading-snapshot';
import snapshotDoc from './trading-snapshot.json';

describe('trading-snapshot', () => {
  it('parses committed snapshot', () => {
    const doc = parseTradingSnapshot(snapshotDoc);
    expect(doc).not.toBeNull();
    expect(doc!.markets.btc.symbol_tv).toContain('BTC');
    expect(doc!.markets.txf.pending).toBe(true);
  });

  it('treats only 偏多/偏空 as directional', () => {
    const doc = parseTradingSnapshot(snapshotDoc)!;
    expect(hasDirectionalSignal(doc.markets.btc)).toBe(false);
    const withLong = applyMarketSignalEvent(doc, 'btc', {
      bias: '偏多',
      summary: '測試',
      signal_at: '2026-10-22T10:00:00+08:00',
    });
    expect(hasDirectionalSignal(withLong.markets.btc)).toBe(true);
    const cleared = applyMarketSignalEvent(withLong, 'btc', { bias: null });
    expect(hasDirectionalSignal(cleared.markets.btc)).toBe(false);
    expect(cleared.markets.btc.signal_at).toBe('2026-10-22T10:00:00+08:00');
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

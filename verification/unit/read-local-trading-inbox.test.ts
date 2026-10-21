import { describe, expect, it } from 'vitest';
import { parseTradingInbox } from '../../scripts/lib/read-local-trading-inbox.mjs';

describe('read-local-trading-inbox', () => {
  it('parses multi-market inbox', () => {
    const doc = parseTradingInbox(
      JSON.stringify({
        markets: {
          btc: { bias: '偏多', summary: 'test', signal_at: '2026-10-22T10:00:00+08:00' },
        },
      }),
    );
    expect(doc.events[0].market).toBe('btc');
    expect(doc.events[0].bias).toBe('偏多');
  });

  it('parses single-market inbox', () => {
    const doc = parseTradingInbox(JSON.stringify({ market: 'btc', bias: null }));
    expect(doc.events).toHaveLength(1);
    expect(doc.events[0].bias).toBeNull();
  });
});

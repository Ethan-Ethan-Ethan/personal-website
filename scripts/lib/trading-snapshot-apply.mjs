/** 與 src/features/workspace/core/trading-snapshot.ts applyMarketSignalEvent 同步 */

export function applyMarketSignalEvent(doc, market, event) {
  const row = { ...doc.markets[market] };
  const at = (event.signal_at && String(event.signal_at).trim()) || new Date().toISOString();
  const bias = event.bias === '觀望' ? null : event.bias;
  if (bias === '偏多' || bias === '偏空') {
    row.bias = bias;
    row.summary = event.summary?.trim() || null;
    row.signal_at = at;
    return { _generated: at, markets: { ...doc.markets, [market]: row } };
  }
  row.bias = null;
  row.summary = null;
  return { _generated: doc._generated, markets: { ...doc.markets, [market]: row } };
}

export function stableSnapshotText(doc) {
  return `${JSON.stringify(doc, null, 2)}\n`;
}

import snapshotDoc from './trading-snapshot.json';

export const TRADING_DISCLAIMER =
  '本區為個人交易自動化紀錄與觀察，非投資建議，亦不構成買賣邀約。依 MASA（麻紗）相關交易習慣與力道框等工具所做的 5 分鐘觀察，需自行心法與風控判斷；盈虧自行負責。歷史與快照不代表未來，圖表與文字皆可能延遲或與實盤不一致。';

export type MarketKey = 'btc' | 'txf';

export type MarketBias = '偏多' | '偏空' | '觀望';

export type MarketSnapshot = {
  symbol_tv: string;
  /** 僅「偏多／偏空」視為有方向訊號；觀望與 null 在 UI 顯示為當前無方向。 */
  bias?: MarketBias | null;
  summary?: string | null;
  method_note: string;
  pending?: boolean;
  /** 最近一次方向訊號時間（ISO）；無訊號時可省略。 */
  signal_at?: string | null;
};

export const NO_DIRECTION_LABEL = '當前無方向';

export function hasDirectionalSignal(market: MarketSnapshot | null | undefined): boolean {
  if (!market || market.pending) return false;
  return market.bias === '偏多' || market.bias === '偏空';
}

export type TradingSnapshotDoc = {
  _generated: string;
  markets: Record<MarketKey, MarketSnapshot>;
};

const BIASES = new Set(['偏多', '偏空', '觀望']);

export function parseTradingSnapshot(doc: unknown): TradingSnapshotDoc | null {
  if (!doc || typeof doc !== 'object') return null;
  const d = doc as Partial<TradingSnapshotDoc>;
  if (typeof d._generated !== 'string' || !d._generated.trim()) return null;
  if (!d.markets || typeof d.markets !== 'object') return null;
  for (const key of ['btc', 'txf'] as const) {
    const m = (d.markets as Record<string, unknown>)[key];
    if (!m || typeof m !== 'object') return null;
    const row = m as Partial<MarketSnapshot>;
    if (typeof row.symbol_tv !== 'string' || !row.symbol_tv.trim()) return null;
    if (typeof row.method_note !== 'string' || !row.method_note.trim()) return null;
    if (row.bias != null && row.bias !== '' && !BIASES.has(row.bias as string)) return null;
    if (row.signal_at != null && row.signal_at !== '' && Number.isNaN(Date.parse(String(row.signal_at)))) return null;
  }
  return d as TradingSnapshotDoc;
}

/** 套用單一市場訊號事件（有方向才寫入 bias/summary/signal_at；無方向則清空方向欄位）。 */
export function applyMarketSignalEvent(
  doc: TradingSnapshotDoc,
  market: MarketKey,
  event: { bias: MarketBias | null; summary?: string | null; signal_at?: string },
): TradingSnapshotDoc {
  const row = { ...doc.markets[market] };
  const at = event.signal_at?.trim() || new Date().toISOString();
  if (event.bias === '偏多' || event.bias === '偏空') {
    row.bias = event.bias;
    row.summary = event.summary?.trim() || null;
    row.signal_at = at;
    return {
      _generated: at,
      markets: { ...doc.markets, [market]: row },
    };
  }
  row.bias = null;
  row.summary = null;
  return {
    _generated: doc._generated,
    markets: { ...doc.markets, [market]: row },
  };
}

export function loadTradingSnapshot(): TradingSnapshotDoc | null {
  return parseTradingSnapshot(snapshotDoc);
}

export function formatGeneratedZh(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

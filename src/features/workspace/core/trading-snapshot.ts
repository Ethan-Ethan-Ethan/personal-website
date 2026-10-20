import snapshotDoc from './trading-snapshot.json';

export const TRADING_DISCLAIMER =
  '本區為個人交易自動化紀錄與觀察，非投資建議，亦不構成買賣邀約。依 MASA（麻紗）相關交易習慣與力道框等工具所做的 5 分鐘觀察，需自行心法與風控判斷；盈虧自行負責。歷史與快照不代表未來，圖表與文字皆可能延遲或與實盤不一致。';

export type MarketKey = 'btc' | 'txf';

export type MarketSnapshot = {
  symbol_tv: string;
  bias?: '偏多' | '偏空' | '觀望' | null;
  summary?: string | null;
  method_note: string;
  pending?: boolean;
};

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
  }
  return d as TradingSnapshotDoc;
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

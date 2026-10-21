import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const VALID_MARKETS = new Set(['btc', 'txf']);
const VALID_BIAS = new Set(['偏多', '偏空', '觀望', null]);

/**
 * 投資交易專案寫入、個人網站讀取的訊號信箱（預設路徑見 resolveTradingInboxPath）。
 * 格式 A（單市場）: { "market": "btc", "bias": "偏多"|"偏空"|null, "summary": "…", "signal_at": "ISO" }
 * 格式 B（多市場）: { "markets": { "btc": { "bias", "summary", "signal_at" }, "txf": {…} } }
 */
export function resolveTradingInboxPath(repoRoot) {
  if (process.env.TRADING_SIGNAL_INBOX?.trim()) {
    return resolve(process.env.TRADING_SIGNAL_INBOX.trim());
  }
  return resolve(
    repoRoot,
    '..',
    '投資交易',
    'outputs',
    'website-trading-signal.json',
  );
}

export function parseTradingInbox(raw) {
  const doc = JSON.parse(raw);
  const events = [];
  if (doc.markets && typeof doc.markets === 'object') {
    for (const [market, row] of Object.entries(doc.markets)) {
      if (!VALID_MARKETS.has(market)) throw new Error(`未知 market: ${market}`);
      events.push(normalizeEvent(market, row));
    }
    return { revision: doc.revision ?? null, events };
  }
  if (doc.market === 'btc' || doc.market === 'txf') {
    return { revision: doc.revision ?? null, events: [normalizeEvent(doc.market, doc)] };
  }
  throw new Error('inbox 需含 market 或 markets');
}

function normalizeEvent(market, row) {
  const bias = row.bias === '觀望' ? null : row.bias ?? null;
  if (!VALID_BIAS.has(bias) && bias !== undefined) {
    throw new Error(`${market}.bias 無效`);
  }
  return {
    market,
    bias: bias ?? null,
    summary: row.summary ?? null,
    signal_at: row.signal_at ?? undefined,
  };
}

export function readTradingInbox(inboxPath) {
  if (!existsSync(inboxPath)) {
    return { status: 'missing', path: inboxPath, events: [] };
  }
  const raw = readFileSync(inboxPath, 'utf-8');
  const { revision, events } = parseTradingInbox(raw);
  return { status: 'ok', path: inboxPath, revision, events };
}

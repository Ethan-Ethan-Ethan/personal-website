const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines';
const MEXC_KLINES = 'https://api.mexc.com/api/v3/klines';
const OKX_CANDLES = 'https://www.okx.com/api/v5/market/candles';

/**
 * @returns {Promise<{ open: number; high: number; low: number; close: number; openTimeMs: number; closeTimeMs: number }[]>}
 */
export async function fetchBtc5mKlines(limit = 120) {
  const n = Math.min(Math.max(limit, 3), 300);
  const errors = [];
  for (const fn of [fetchOkx5m, fetchMexc5m, fetchBinance5m]) {
    try {
      return await fn(n);
    } catch (e) {
      errors.push(e?.message || String(e));
    }
  }
  throw new Error(`所有 K 線來源失敗：${errors.join(' | ')}`);
}

async function fetchBinance5m(limit) {
  const url = `${BINANCE_KLINES}?symbol=BTCUSDT&interval=5m&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Binance klines HTTP ${res.status}`);
  const raw = await res.json();
  return mapBinanceLike(raw);
}

async function fetchMexc5m(limit) {
  const url = `${MEXC_KLINES}?symbol=BTCUSDT&interval=5m&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`MEXC klines HTTP ${res.status}`);
  const raw = await res.json();
  return mapBinanceLike(raw);
}

async function fetchOkx5m(limit) {
  const url = `${OKX_CANDLES}?instId=BTC-USDT&bar=5m&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`OKX candles HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== '0' || !Array.isArray(json.data) || json.data.length === 0) {
    throw new Error(`OKX candles bad response: ${json.code ?? 'unknown'}`);
  }
  const rows = json.data.map((k) => ({
    openTimeMs: Number(k[0]),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    closeTimeMs: Number(k[0]) + 300_000 - 1,
  }));
  rows.reverse();
  return rows;
}

function mapBinanceLike(raw) {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('K 線空陣列');
  return raw.map((k) => ({
    openTimeMs: Number(k[0]),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    closeTimeMs: Number(k[6]),
  }));
}

/** 最後一根已收盤 K（倒數第二根；最後一根為進行中）。 */
export function lastClosedCandle(candles) {
  if (!candles || candles.length < 2) return null;
  return candles[candles.length - 2];
}

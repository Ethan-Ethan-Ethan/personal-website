const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines';

/**
 * @returns {Promise<{ open: number; high: number; low: number; close: number; openTimeMs: number; closeTimeMs: number }[]>}
 */
export async function fetchBtc5mKlines(limit = 120) {
  const url = `${BINANCE_KLINES}?symbol=BTCUSDT&interval=5m&limit=${Math.min(Math.max(limit, 3), 1000)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Binance klines HTTP ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Binance klines 空陣列');
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

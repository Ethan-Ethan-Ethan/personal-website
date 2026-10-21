#!/usr/bin/env node
/**
 * 拉 BTC 5m K 線 → 評估訊號 → 有變才寫 trading-snapshot.json。
 * GitHub Actions 定時呼叫；本機：npm run trading:automation
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchBtc5mKlines } from './lib/fetch-btc-klines.mjs';
import { evaluateBtc5m, signalToMarketEvent } from './lib/trading-signal-eval.mjs';
import { applyMarketSignalEvent, stableSnapshotText } from './lib/trading-snapshot-apply.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/features/workspace/core/trading-snapshot.json');

const DRY = process.argv.includes('--dry-run');

function loadDoc() {
  return JSON.parse(readFileSync(OUT, 'utf-8'));
}

async function main() {
  const candles = await fetchBtc5mKlines(60);
  const signal = evaluateBtc5m(candles);
  const event = signalToMarketEvent(signal);
  const doc = loadDoc();
  const next = applyMarketSignalEvent(doc, 'btc', event);
  const before = stableSnapshotText(doc);
  const after = stableSnapshotText(next);

  if (before === after) {
    console.log('NO_CHANGE: btc snapshot unchanged');
    process.exit(0);
  }

  if (DRY) {
    console.log(after);
    process.exit(0);
  }

  writeFileSync(OUT, after, 'utf-8');
  const label = signal.kind === 'directional' ? signal.bias : 'no_direction';
  console.log(`UPDATED: btc ${label} → ${OUT}`);
}

main().catch((e) => {
  console.error(`FAIL: ${e?.message || e}`);
  process.exit(1);
});

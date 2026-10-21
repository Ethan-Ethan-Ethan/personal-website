#!/usr/bin/env node
/**
 * 將「交易訊號事件」合併進 trading-snapshot.json。
 * 僅在自動化判定偏多／偏空時呼叫（或明確傳 no_direction 清除方向）；不從 K 線推導訊號。
 *
 * 事件 JSON（--event <path> 或 stdin）：
 *   { "market": "btc"|"txf", "bias": "偏多"|"偏空"|null, "summary": "…", "signal_at": "ISO 可選" }
 * bias 為 null／觀望 → 清空方向與 summary，保留上次 signal_at；_generated 僅在偏多／偏空時更新。
 *
 * 用法: node scripts/sync-trading-snapshot.mjs --event ./signal.json [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMarketSignalEvent, stableSnapshotText } from './lib/trading-snapshot-apply.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/features/workspace/core/trading-snapshot.json');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const eventIdx = args.indexOf('--event');
const eventPath = eventIdx >= 0 ? args[eventIdx + 1] : null;

if (args.includes('--help')) {
  console.log(`sync-trading-snapshot.mjs — 合併訊號事件到 snapshot\n\n  node scripts/sync-trading-snapshot.mjs --event signal.json [--dry-run]\n  cat signal.json | node scripts/sync-trading-snapshot.mjs [--dry-run]`);
  process.exit(0);
}
if (!eventPath && process.stdin.isTTY) {
  console.error('FAIL: 需要 --event <file> 或 pipe JSON 到 stdin');
  process.exit(1);
}

function loadEvent() {
  const raw = eventPath ? readFileSync(resolve(process.cwd(), eventPath), 'utf-8') : readFileSync(0, 'utf-8');
  const ev = JSON.parse(raw);
  if (ev.market !== 'btc' && ev.market !== 'txf') throw new Error('market 須為 btc 或 txf');
  if (ev.bias != null && ev.bias !== '偏多' && ev.bias !== '偏空' && ev.bias !== '觀望') {
    throw new Error('bias 須為 偏多、偏空、觀望 或 null');
  }
  return ev;
}

try {
  const ev = loadEvent();
  const doc = JSON.parse(readFileSync(OUT, 'utf-8'));
  const next = applyMarketSignalEvent(doc, ev.market, ev);
  const text = stableSnapshotText(next);
  if (DRY) {
    console.log(text);
    process.exit(0);
  }
  writeFileSync(OUT, text, 'utf-8');
  console.log(`OK: merged ${ev.market} bias=${ev.bias ?? 'null'} → ${OUT}`);
} catch (e) {
  console.error(`FAIL: ${e?.message || e}`);
  process.exit(1);
}

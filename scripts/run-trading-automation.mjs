#!/usr/bin/env node
/**
 * 從本機投資交易 outputs 讀訊號信箱 → 有變才寫 trading-snapshot.json。
 * 定時：launchd（scripts/install-trading-launchd.sh）或投資交易 pipeline 結尾手動呼叫。
 *
 * 環境變數：
 *   TRADING_SIGNAL_INBOX — 覆寫信箱 JSON 路徑
 *   TRADING_LOCAL_DEPLOY=1 — 快照變更後 git commit + push main（需本機 git 權限）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { readTradingInbox, resolveTradingInboxPath } from './lib/read-local-trading-inbox.mjs';
import { applyMarketSignalEvent, stableSnapshotText } from './lib/trading-snapshot-apply.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/features/workspace/core/trading-snapshot.json');
const DRY = process.argv.includes('--dry-run');

function loadDoc() {
  return JSON.parse(readFileSync(OUT, 'utf-8'));
}

function maybeDeploy() {
  if (process.env.TRADING_LOCAL_DEPLOY !== '1') return;
  execSync('git add src/features/workspace/core/trading-snapshot.json', { cwd: ROOT, stdio: 'inherit' });
  try {
    execSync('git diff --staged --quiet', { cwd: ROOT });
    return;
  } catch {
    execSync('git commit -m "chore: trading snapshot from local inbox"', { cwd: ROOT, stdio: 'inherit' });
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
    console.log('DEPLOYED: pushed origin main (Cloudflare deploy will follow)');
  }
}

function main() {
  const inboxPath = resolveTradingInboxPath(ROOT);
  const inbox = readTradingInbox(inboxPath);
  if (inbox.status === 'missing') {
    console.log(`NO_INBOX: ${inbox.path}`);
    process.exit(0);
  }

  let doc = loadDoc();
  const before = stableSnapshotText(doc);
  for (const event of inbox.events) {
    doc = applyMarketSignalEvent(doc, event.market, event);
  }
  const after = stableSnapshotText(doc);

  if (before === after) {
    console.log('NO_CHANGE: snapshot matches inbox state');
    process.exit(0);
  }

  if (DRY) {
    console.log(after);
    process.exit(0);
  }

  writeFileSync(OUT, after, 'utf-8');
  console.log(`UPDATED: from ${inbox.path}`);
  maybeDeploy();
}

try {
  main();
} catch (e) {
  console.error(`FAIL: ${e?.message || e}`);
  process.exit(1);
}

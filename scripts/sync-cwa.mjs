#!/usr/bin/env node
/**
 * sync-cwa.mjs — 中央氣象署 F-D0047-091（逐12小時1週預報）→ src/features/workspace/core/cwa-snapshot.json。
 * key 由環境變數 CWA_API_KEY 來（Keychain；明文永不落地）：CWA_API_KEY=$(security find-generic-password -s cwa -w) npm run sync:cwa
 * 落地只有去 key 的 snapshot；抓取失敗／結構不合即非零退出，不寫半成品。
 * 用法: node scripts/sync-cwa.mjs [--dry-run] [--limit N] [--unlock] [--check] [--help]
 */
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/features/workspace/core/cwa-snapshot.json");
const LOCK = resolve(process.env.TMPDIR || "/tmp", "personal-website-cwa-sync.lock");
const DATASTORE = "F-D0047-091";
const API = "https://opendata.cwa.gov.tw/api/v1/rest/datastore";

const ERROR_HINTS = {
  "no-key": "CWA_API_KEY 未設定：先 security find-generic-password -s cwa -w 確認 Keychain，再帶環境變數重跑",
  network: "連線失敗：檢查網路／opendata.cwa.gov.tw 是否可達（curl -sI 同網址）",
  "bad-shape": "回應結構不合：氣象署可能改版，先 --dry-run 看原始欄位再修 parse",
  locked: "lock 仍在：若無其他實例在跑，加 --unlock 清掉後重跑",
};

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(`sync-cwa.mjs — 抓氣象署週預報落地 snapshot\n\n用法: node scripts/sync-cwa.mjs [--dry-run] [--limit N] [--unlock] [--check] [--help]\n  --dry-run  只 preflight＋抓 1 筆驗形狀，不寫檔\n  --limit N  每頁筆數（預設 100，22 縣市一次取完）\n  --unlock   清 lock 後退出\n  --check    只檢查已落地 snapshot（存在＋可解析＋36h 內＋县市數），不抓取\n環境: CWA_API_KEY（Keychain service=cwa；CI 請用已提交的 snapshot，不必帶 key）`);
  process.exit(0);
}
if (args.includes("--unlock")) {
  if (existsSync(LOCK)) unlinkSync(LOCK);
  console.log("lock cleared");
  process.exit(0);
}
if (args.includes("--check")) {
  // 健康探針（不抓取）：給 gate/CI 用，壞在源頭不壞在 render。
  try {
    const doc = JSON.parse(readFileSync(OUT, "utf-8"));
    const n = doc?.records?.Locations?.[0]?.Location?.length ?? 0;
    const ageH = (Date.now() - Date.parse(doc?.fetchedAt)) / 3600000;
    if (!n) fail("bad-shape", "snapshot 無縣市");
    if (!Number.isFinite(ageH) || ageH > 36 || ageH < 0) fail("bad-shape", `snapshot 過期 ${Number.isFinite(ageH) ? ageH.toFixed(1) : "?"}h（>36h 請重跑 sync）`);
    console.log(`CHECK-OK: ${n} 縣市，年齡 ${ageH.toFixed(1)}h`);
    process.exit(0);
  } catch (e) {
    fail("bad-shape", `snapshot 不可讀：${e?.message || e}`);
  }
}
const DRY = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 100 : 100;

function fail(code, msg) {
  console.error(`FAIL[${code}]: ${msg}`);
  if (ERROR_HINTS[code]) console.error(`HINT: ${ERROR_HINTS[code]}`);
  try { if (existsSync(LOCK)) unlinkSync(LOCK); } catch {}
  process.exit(1);
}

function acquireLock() {
  if (existsSync(LOCK)) {
    try {
      const age = Date.now() - Number(readFileSync(LOCK, "utf-8"));
      if (age < 10 * 60 * 1000) fail("locked", `lock 年齡 ${Math.round(age / 1000)}s`);
    } catch {}
  }
  writeFileSync(LOCK, String(Date.now()));
}
function releaseLock() {
  try { if (existsSync(LOCK)) unlinkSync(LOCK); } catch {}
}

// Preflight：key → 網路/datastore 可達（limit=1 探測）
async function preflight(key) {
  if (!key) fail("no-key", "CWA_API_KEY 為空");
  let res;
  try {
    res = await fetch(`${API}/${DATASTORE}?Authorization=${key}&format=JSON&limit=1`);
  } catch (e) {
    fail("network", String(e));
  }
  if (!res.ok) fail("network", `HTTP ${res.status}`);
  const j = await res.json();
  if (j?.success !== "true") fail("bad-shape", `success=${JSON.stringify(j?.success)}`);
  return true;
}

function assertShape(j) {
  const locs = j?.records?.Locations?.[0]?.Location;
  if (!Array.isArray(locs) || locs.length === 0) fail("bad-shape", "無 Location");
  const need = ["平均溫度", "最高溫度", "最低溫度", "平均相對濕度", "風速", "12小時降雨機率", "天氣現象", "最大舒適度指數"];
  const names = new Set(locs[0].WeatherElement.map((e) => e.ElementName));
  for (const n of need) {
    if (!names.has(n)) fail("bad-shape", `缺 WeatherElement ${n}`);
  }
  return locs;
}

async function fetchAll(key) {
  const out = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API}/${DATASTORE}?Authorization=${key}&format=JSON&limit=${LIMIT}&offset=${offset}`);
    if (!res.ok) fail("network", `HTTP ${res.status} @offset=${offset}`);
    const j = await res.json();
    const locs = assertShape(j);
    out.push(...locs);
    if (locs.length < LIMIT) break;
    offset += LIMIT;
    if (offset > 1000) fail("bad-shape", "分頁異常（>1000），停手");
  }
  return out;
}

async function main() {
  acquireLock();
  const key = process.env.CWA_API_KEY || "";
  await preflight(key);
  if (DRY) {
    console.log("DRY-RUN: preflight 綠（key＋網路＋形狀），未寫檔");
    releaseLock();
    process.exit(0);
  }
  const locs = await fetchAll(key);
  // 落地＝API 回應原形狀（cwa-forecast.parseCwaWeekly 直接消費，不二手轉譯），僅去 key。
  const snapshot = {
    _generated: "scripts/sync-cwa.mjs — 手動改會被覆蓋",
    datastore: DATASTORE,
    fetchedAt: new Date().toISOString(),
    attribution: "資料來源：中央氣象署開放資料平臺",
    success: "true",
    records: { Locations: [{ DatasetDescription: "臺灣各縣市鄉鎮未來1週逐12小時天氣預報", LocationsName: "台灣", Location: locs }] },
  };
  // Verify：重讀＋斷言後才算數
  const text = JSON.stringify(snapshot, null, 1);
  const back = JSON.parse(text);
  const nLoc = back?.records?.Locations?.[0]?.Location?.length ?? 0;
  if (!nLoc) fail("bad-shape", "落地為空");
  writeFileSync(OUT, text + "\n");
  console.log(`OK: ${nLoc} 縣市 → ${OUT}`);
  releaseLock();
  process.exit(0);
}

main().catch((e) => fail("network", String(e?.message || e)));

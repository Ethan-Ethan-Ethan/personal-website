#!/usr/bin/env node
/**
 * sync-gmail.mjs — 兩份 W42 大綱（Vault 00_Inbox）→ src/features/workspace/core/gmail-digest.json。
 * 靜態 bake：同輸入同 JSON（key 排序＋固定欄序，兩次 bake hash 相等即重現）。
 * angle 永不分類：條目須帶【功用|因果|解決|資訊】前綴（人工提案＋Ethan 確認），缺前綴或文法不合即非零退出並列行號（fail-closed，回源頭修再 bake）。★=精選（每主題恰 3）。
 * 用法: node scripts/sync-gmail.mjs [--dry-run] [--unlock] [--check] [--help]
 * Env 覆寫（僅測用）：GMAIL_IN1 / GMAIL_IN2（輸入大綱）、GMAIL_OUT（輸出 JSON）。
 */
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_IN1 = "/Users/ethan/Documents/Obsidian Vault/00_Inbox/週報-2026-W42-大綱.md";
const DEFAULT_IN2 = "/Users/ethan/Documents/Obsidian Vault/00_Inbox/bnext-回補-大綱-2026-W42.md";
const IN1 = resolve(process.env.GMAIL_IN1 || DEFAULT_IN1);
const IN2 = resolve(process.env.GMAIL_IN2 || DEFAULT_IN2);
const OUT = resolve(process.env.GMAIL_OUT || resolve(ROOT, "src/features/workspace/core/gmail-digest.json"));
const LOCK = resolve(process.env.TMPDIR || "/tmp", "personal-website-gmail-sync.lock");
const WEEK = "2026-W42";
// 本週報覆蓋範圍（出處：00_Inbox/週報-2026-W42-大綱.md L8 source 行 `10/07–10/14`；bnext 回補 2026-07-15–10/14 是累積回補不取其起日）。僅展示用，week 維持 W42 保可重現。
const WEEK_RANGE = "10/07–10/14";

// 段映射（spec §資料流）：附註段一律排除不 bake。快訊=時效通知（行事曆／政策時程／版本退場上線／發表會），第四段。
const SECTION_MAP = {
  "一、學習資訊": "study",
  "二、投資": "invest",
  "三、本月促銷優惠": "promo",
  "四、快訊": "flash",
};
const SECTION_ORDER = ["study", "invest", "promo", "flash"];
const SECTION_LABEL = { study: "學習", invest: "投資", promo: "本月促銷優惠", flash: "快訊" };

// 明示非條目行（有 --help 文件化，dry-run 逐行 SKIP 打點）：其餘 `- ` 行一律走文法，失敗即 exit 非零。
const SKIP_PATTERNS = [/無.+產出/, /不列(入)?優惠/, /非投資.+備查/];
// 促銷時效啟發式（僅 promo 段；命中才附 expiry，不命中不編造）。
const EXPIRY_PATTERNS = [/\d{1,2}\/\d{1,2}\s*前/, /至\s*\d{1,2}\/\d{1,2}/, /限定\s*\d+\s*天/, /年底前截止/, /\d{1,2}\/\d{1,2}\s*[–—-]\s*\d{1,2}/];
const DATE_RE = /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/;
const DATE_TOKEN_RE = new RegExp(`^\\s*(?:${DATE_RE.source})(?:\\s*內文)?\\s*$`);
const LINK_RE = /https?:\/\/\S+/g;

const ERROR_HINTS = {
  "missing-input": "輸入大綱缺失：確認兩檔在 00_Inbox（測用可用 GMAIL_IN1/GMAIL_IN2 指暫存檔）",
  "parse-fail": "條目文法不合：回源頭大綱修該行（加【功用|因果|解決|資訊】前綴＋（date，source），精選加★），再重跑 bake",
  locked: "lock 仍在：若無其他實例在跑，加 --unlock 清掉後重跑",
};

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(`sync-gmail.mjs — W42 兩大綱 bake 成 gmail-digest.json（靜態 embed，零 key）

用法: node scripts/sync-gmail.mjs [--dry-run] [--unlock] [--check] [--help]
  --dry-run  只 preflight＋解析＋列段計數，不寫檔
  --unlock   清 lock 後退出
  --check    只檢查已落地 JSON（存在＋可解析＋四段皆有卡＋angle/claim 非空），不 bake
輸入: 00_Inbox/週報-2026-W42-大綱.md ＋ bnext-回補-大綱-2026-W42.md
段映射: ## 一、學習資訊→study／## 二、投資→invest／## 三、本月促銷優惠→promo／## 四、快訊→flash；## 附註排除
條目文法: - [★]【angle】claim（date，source）[— link]（angle=功用|因果|解決|資訊必填；★=精選每段恰3；連結僅收錄大綱已有的，不編造）
顯式跳過（SKIP，不算失敗）: 無…產出／不列…優惠／非投資…備查行；其餘解析失敗行 exit 非零並列行號`);
  process.exit(0);
}
if (args.includes("--unlock")) {
  if (existsSync(LOCK)) unlinkSync(LOCK);
  console.log("lock cleared");
  process.exit(0);
}

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

// Preflight：兩輸入存在＋可讀（零 key；靜態大綱已是明文）。
function preflight() {
  for (const f of [IN1, IN2]) {
    if (!existsSync(f)) fail("missing-input", `輸入缺失：${f}`);
    try { readFileSync(f, "utf-8"); }
    catch (e) { fail("missing-input", `輸入不可讀：${f}（${e?.message || e}）`); }
  }
  return true;
}

function fileTag(path) {
  return path === IN1 ? "週報" : path === IN2 ? "bnext" : path;
}

/** 解析單檔 → { items, skipped }；任一文法失敗 throw { file, line, text }。 */
export function parseOutline(text, file) {
  const lines = text.split("\n");
  const items = [];
  const skipped = [];
  let topic = null;
  const errors = [];
  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    const line = raw.trimEnd();
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      // 段標題或帶括號附言（## 二、投資（金融…））：以前綴查映射表
      const key = h[1].trim().replace(/（.*$/, "");
      topic = SECTION_MAP[key] ?? (key === "附註" ? "note" : null);
      return;
    }
    if (!topic || topic === "note") return;
    if (!line.startsWith("- ")) return;
    const body = line.slice(2).trim();
    if (SKIP_PATTERNS.some((p) => p.test(body))) {
      skipped.push({ file: fileTag(file), line: lineNo, text: body.slice(0, 40) });
      return;
    }
    try {
      items.push(parseEntry(body, topic));
    } catch (e) {
      errors.push({ file: fileTag(file), line: lineNo, text: body.slice(0, 80), reason: e.message });
    }
  });
  if (errors.length) {
    const msg = errors.map((e) => `${e.file}:${e.line}（${e.reason}）：${e.text}`).join("\n  ");
    const err = new Error(`parse-fail ${errors.length} 行:\n  ${msg}`);
    err.details = errors;
    throw err;
  }
  return { items, skipped };
}

/** - [★]【angle】claim（meta）[— tail]；meta=末個全形括號；tail 無 http 即附 claim（不編 link）。
 *  ★=精選（每主題恰 3，bake 斷言）；angle=功用|因果|解決|資訊（資訊=直陳無痛點：放假政策／版本更新／功能通知等）。 */
export function parseEntry(body, topic) {
  const m = body.match(/^(★?)【(功用|因果|解決|資訊)】\s*(.+)$/s);
  if (!m) throw new Error("缺【功用|因果|解決|資訊】前綴");
  const featured = m[1] === "★";
  let rest = m[3].trim();
  const angle = m[2];
  // tail：最後一個 "—" 之後；含 http 才算連結。
  let links = [];
  let note = "";
  const dash = rest.lastIndexOf("—");
  if (dash >= 0) {
    const tail = rest.slice(dash + 1).trim();
    const found = tail.match(LINK_RE) || [];
    links = found.map((u) => u.replace(/[）)。,.；;]+$/, ""));
    if (links.length === 0) note = tail;
    rest = rest.slice(0, dash).trim();
  }
  // meta：末個全形括號；claim=其前（文內括號保留）。
  const pm = rest.match(/（([^（）]*)）\s*$/);
  if (!pm) throw new Error("缺末組（date，source）");
  const meta = pm[1];
  let claim = rest.slice(0, pm.index).trim();
  if (!claim) throw new Error("claim 空");
  if (note) claim = `${claim} — ${note}`;
  const { date, source } = splitMeta(meta);
  const item = { topic, angle, claim, date, source };
  if (featured) item.featured = true;
  if (links.length) {
    item.link = links[0];
    item.links = links;
  }
  if (topic === "promo") {
    const ex = EXPIRY_PATTERNS.map((p) => (claim + meta).match(p)?.[0]).find(Boolean);
    if (ex) item.expiry = ex.trim();
  }
  return item;
}

/** meta 切 token：日期形 token→date（、串接），其餘→source（；串接）；全無日期即失敗。 */
function splitMeta(meta) {
  const tokens = meta.split(/[，,；;、]/).map((t) => t.trim()).filter(Boolean);
  const dates = [];
  const srcs = [];
  for (const t of tokens) {
    // 全形 ／ 串接的多日期（2026-10-08／10-09、2026-08-26／27／28）：每段皆日期形才算日期
    const parts = t.split(/[／/]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((s) => DATE_TOKEN_RE.test(s) || /^\d{1,2}$/.test(s))) {
      dates.push(...parts);
      continue;
    }
    if (DATE_TOKEN_RE.test(t)) {
      dates.push(t.replace(/\s*內文\s*/, ""));
    } else if (DATE_RE.test(t) && /內文/.test(t)) {
      const d = t.match(DATE_RE)?.[0];
      if (d) dates.push(d);
    } else {
      srcs.push(t);
    }
  }
  if (!dates.length) throw new Error(`meta 無日期：${meta}`);
  return { date: dates.join("、"), source: srcs.join("；") || "–" };
}

function stableStringify(doc) {
  const items = [...doc.items].sort((a, b) =>
    SECTION_ORDER.indexOf(a.topic) - SECTION_ORDER.indexOf(b.topic) || a.claim.localeCompare(b.claim, "zh-Hant"));
  return JSON.stringify({ _generated: doc._generated, week: doc.week, weekRange: doc.weekRange, sources: doc.sources, items }, null, 1) + "\n";
}

function assertDigest(doc) {
  for (const t of SECTION_ORDER) {
    const n = doc.items.filter((i) => i.topic === t).length;
    if (!n) fail("parse-fail", `段 ${t}（${SECTION_LABEL[t]}）無卡`);
    const stars = doc.items.filter((i) => i.topic === t && i.featured === true).length;
    if (stars !== 3) fail("parse-fail", `段 ${t}（${SECTION_LABEL[t]}）精選★需恰 3（現 ${stars}）：回源頭大綱該段加★／刪★再 bake`);
  }
  for (const [i, it] of doc.items.entries()) {
    if (!["功用", "因果", "解決", "資訊"].includes(it.angle)) fail("parse-fail", `items[${i}] angle 非法`);
    if (!it.claim?.trim()) fail("parse-fail", `items[${i}] claim 空`);
    if (it.link && !/^https?:\/\//.test(it.link)) fail("parse-fail", `items[${i}] link 非 http（編造嫌疑）`);
    for (const u of it.links || []) {
      if (!/^https?:\/\//.test(u)) fail("parse-fail", `items[${i}] links 非 http（編造嫌疑）`);
    }
  }
}

function bake() {
  preflight();
  const all = [];
  const skippedAll = [];
  const errAll = [];
  for (const f of [IN1, IN2]) {
    try {
      const { items, skipped } = parseOutline(readFileSync(f, "utf-8"), f);
      all.push(...items);
      skippedAll.push(...skipped);
    } catch (e) {
      if (e.details) errAll.push(...e.details);
      else throw e;
    }
  }
  if (errAll.length) {
    const msg = errAll.map((e) => `${e.file}:${e.line}（${e.reason}）：${e.text}`).join("\n  ");
    throw new Error(`parse-fail ${errAll.length} 行:\n  ${msg}`);
  }
  const doc = {
    _generated: "scripts/sync-gmail.mjs — 手動改會被覆蓋",
    week: WEEK,
    weekRange: WEEK_RANGE,
    sources: ["00_Inbox/週報-2026-W42-大綱.md", "00_Inbox/bnext-回補-大綱-2026-W42.md"],
    items: all,
  };
  assertDigest(doc);
  return { doc, skippedAll };
}

if (args.includes("--check")) {
  try {
    const doc = JSON.parse(readFileSync(OUT, "utf-8"));
    assertDigest(doc);
    const counts = SECTION_ORDER.map((t) => `${t}=${doc.items.filter((i) => i.topic === t).length}`).join(" ");
    console.log(`CHECK-OK: ${doc.items.length} 條（${counts}），week=${doc.week}`);
    process.exit(0);
  } catch (e) {
    if (e?.message?.startsWith("parse-fail") || e?.message?.startsWith("段 ") || e?.message?.startsWith("items["))
      fail("parse-fail", e.message);
    fail("missing-input", `快照不可讀：${e?.message || e}`);
  }
}

async function main() {
  acquireLock();
  try {
    preflight();
  } catch (e) {
    fail("missing-input", e.message);
  }
  let baked;
  try {
    baked = bake();
  } catch (e) {
    fail("parse-fail", e.message);
  }
  const { doc, skippedAll } = baked;
  const counts = SECTION_ORDER.map((t) => `${t}=${doc.items.filter((i) => i.topic === t).length}`).join(" ");
  const DRY = args.includes("--dry-run");
  if (DRY) {
    console.log(`DRY-RUN: preflight 綠＋解析 ${doc.items.length} 條（${counts}），SKIP ${skippedAll.length} 行，未寫檔`);
    for (const s of skippedAll) console.log(`  SKIP ${s.file}:${s.line}：${s.text}`);
    releaseLock();
    process.exit(0);
  }
  const text = stableStringify(doc);
  const back = JSON.parse(text);
  assertDigest(back);
  writeFileSync(OUT, text);
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 12);
  console.log(`OK: ${doc.items.length} 條（${counts}）→ ${OUT} sha=${hash}`);
  releaseLock();
  process.exit(0);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main().catch((e) => fail("parse-fail", String(e?.message || e)));

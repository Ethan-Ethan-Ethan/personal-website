#!/usr/bin/env node
// check-transition-single-source.mjs — 過場單一正本守門（2026-10-13 自主預防）。
// 規則：One property, one driver, one clock。
// 檢查：
//  1. 同一檔案禁同時出現 GSAP tween 與 CSS transition/animation 驅動 opacity/transform（並存即違規，除非有 // transition-guard: allow 註記）
//  2. 條件掛載（{open && <X/>}）的元件禁自帶進場 transition（應用常駐 + class 翻轉，見 LakeOverlay 常駐渲染）
//  3. backdrop-blur 類必須與 is-open/open 同 commit 切換（禁延後掛載造成第二段霧化跳）
// 用法：node scripts/check-transition-single-source.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TARGETS = [
  'src/features/workspace/elements/ForecastGlass.tsx',
  'src/features/workspace/elements/ForecastSideRail.tsx',
  'src/features/workspace/elements/LakeOverlay.tsx',
];
const PROP_RE = /(opacity|transform|backdrop-filter|backdropFilter|visibility|display)\s*[:=]/;
let violations = [];

for (const rel of TARGETS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('transition-guard: allow')) continue;
  const hasGsap = /fromTo|gsap\.to|gsap\.timeline|await import\(['"]gsap['"]\)/.test(src);
  const hasCssAnim = /transition\s*:|animation\s*:|@keyframes/.test(src);
  const drivesSameProp = PROP_RE.test(src);
  // 規則1：GSAP 與 CSS 同檔並存且都碰視覺屬性
  if (hasGsap && hasCssAnim && drivesSameProp) {
    violations.push({ file: rel, rule: 'no-dual-drivers', detail: 'GSAP 與 CSS transition/animation 並存且觸及同屬性' });
  }
  // 規則2：條件掛載 + 進場 transition
  if (/\{[^}]*&&\s*<(ForecastGlass|ForecastSideRail|Forecast[A-Z]\w*)/.test(src) && hasCssAnim) {
    violations.push({ file: rel, rule: 'no-mount-animation', detail: '條件掛載元件自帶進場動畫，應用常駐 + class 翻轉' });
  }
  // 規則3：blur 延後掛載（live 門控 blur 但 opacity 先跑）
  if (/backdrop-blur|backdropFilter/.test(src) && /\blive\b/.test(src) && /!live|live \?/.test(src)) {
    // 允許原子同 commit（blur 與 is-open 同一表達式），僅擋「live 後才掛 blur」的分段寫法
    if (/opacity[\s\S]{0,400}live|live[\s\S]{0,400}backdrop/i.test(src)) {
      violations.push({ file: rel, rule: 'no-deferred-blur', detail: 'blur 疑似延後於 opacity 掛載，請確認與 is-open 原子同 commit', level: 'warn' });
    }
  }
}

const argJson = process.argv.includes('--json');
if (argJson) console.log(JSON.stringify({ violations }, null, 2));
else {
  if (!violations.length) console.log('transition single-source: ok');
  else {
    console.log(`transition single-source: ${violations.length} violation(s)`);
    for (const v of violations) console.log(`- [${v.rule}] ${v.file}: ${v.detail}`);
    process.exit(1);
  }
}

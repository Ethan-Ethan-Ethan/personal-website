#!/usr/bin/env node
// Release integrity gate, not a licensing/provenance review.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, '..');
const required = [
  '/assets/galaxy/cozy-galaxy-workspace-reference.png',
  '/assets/galaxy/window-aperture-v3.png',
  '/assets/galaxy/plush-cape-desktop-v1.webp',
  '/assets/galaxy/plush-cape-mobile-v1.webp',
];
const regex = /\/assets\/galaxy\/[A-Za-z0-9._-]+\.(?:png|webp|jpg|jpeg|svg|gif)/g;
const extensions = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.astro']);
const found = new Set();

function scan(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(file);
    } else if (entry.isFile() &&
               [...extensions].some((ext) => entry.name.endsWith(ext)) &&
               !/\.(?:test|spec)\./.test(entry.name)) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(regex)) found.add(match[0]);
    }
  }
}

scan(join(root, 'src'));
let failed = 0;
for (const ref of required) {
  if (!found.has(ref)) {
    console.error('Missing critical source reference:', ref);
    failed++;
  }
}
if (!existsSync(join(root, 'dist'))) {
  console.error('Missing dist/ build output (run npm run build first)');
  failed++;
}
for (const ref of [...found].sort()) {
  const path = ref.replace(/^\//, '');
  for (const base of ['public', 'dist']) {
    if (!existsSync(join(root, base, path))) {
      console.error('Missing referenced asset in ' + base + ':', ref);
      failed++;
    }
  }
}
if (failed) {
  console.error('Release asset gate: FAIL (' + failed + ' issues)');
  process.exitCode = 1;
} else {
  console.log('Release asset gate: PASS (' + found.size + ' referenced galaxy assets in public/ and dist/)');
}

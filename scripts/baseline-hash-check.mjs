#!/usr/bin/env node
// baseline-hash-check.mjs (G4): bind visual baseline files to their manifest.
// Usage:
//   node scripts/baseline-hash-check.mjs [--help]
//   npm run verify:baseline-hashes
// Recomputes sha256 of every file listed in the snapshots baseline_manifest
// and fails on any mismatch (tamper => FAIL). Does NOT enforce approval:
// approved_by_human stays null until a human approves (never backfilled).
// Residual limitation (recorded, not solved here): editing the manifest
// itself to match tampered files is not detected; that needs signed or
// commit-pinned manifests (out of scope).
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(
  ROOT,
  "verification/e2e/visual-fusion.spec.ts-snapshots/baseline_manifest.json"
);

export async function checkBaselineHashes(manifestPath = DEFAULT_MANIFEST) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.baselines)) throw new Error("baseline manifest must have a baselines list");
  const mismatches = [];
  for (const entry of manifest.baselines) {
    if (!entry?.file || !entry?.sha256) throw new Error(`baseline malformed entry: ${JSON.stringify(entry)}`);
    const bytes = await readFile(resolve(dirname(manifestPath), entry.file));
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== entry.sha256.toLowerCase()) mismatches.push(entry.file);
  }
  if (mismatches.length) throw new Error(`baseline hash mismatch: ${mismatches.join("; ")}`);
  return { ok: true, files: manifest.baselines.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/baseline-hash-check.mjs [--help]\nRecomputes baseline PNG hashes; mismatch fails.\n");
  } else {
    try {
      const result = await checkBaselineHashes();
      process.stdout.write(`baseline-hashes: ok (${result.files} files)\n`);
    } catch (error) {
      process.stderr.write(`baseline-hashes: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}

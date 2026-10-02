#!/usr/bin/env node
// n-budget-check.mjs (G2): standalone N-budget gate. Usage:
//   node scripts/n-budget-check.mjs [--help]
//   npm run verify:n-budget
// Reads verification/n-budget.yaml; any entry with used > N fails.
// Missing registry also fails (fail-closed: register the case first).
// Standalone by design: the site-system command contract is frozen and
// rejects new verify.* actions, so this gate lives beside it (like
// commit:safe), not inside `verify *`.
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function checkNBudgetEntries(entries) {
  if (!Array.isArray(entries)) throw new Error("n-budget registry must be a list");
  const offenders = [];
  for (const entry of entries) {
    if (
      !entry || typeof entry.case !== "string" ||
      !Number.isInteger(entry.n) || !Number.isInteger(entry.used) ||
      typeof entry.status !== "string"
    ) throw new Error(`n-budget malformed entry: ${JSON.stringify(entry)}`);
    if (entry.used > entry.n) offenders.push(`${entry.case} (used ${entry.used} > N ${entry.n})`);
  }
  if (offenders.length) throw new Error(`n-budget exceeded: ${offenders.join("; ")}`);
  return offenders;
}

export async function verifyNBudget(root = ROOT, registry = resolve(root, "verification/n-budget.yaml")) {
  let raw;
  try {
    raw = await readFile(registry, "utf8");
  } catch {
    throw new Error("n-budget registry missing: verification/n-budget.yaml (fail-closed: register the case first)");
  }
  const entries = parseYaml(raw);
  checkNBudgetEntries(entries);
  return { ok: true, cases: entries.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/n-budget-check.mjs [--help]\nChecks verification/n-budget.yaml; used > N fails.\n");
  } else {
    try {
      const result = await verifyNBudget();
      process.stdout.write(`n-budget: ok (${result.cases} cases)\n`);
    } catch (error) {
      process.stderr.write(`n-budget: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}

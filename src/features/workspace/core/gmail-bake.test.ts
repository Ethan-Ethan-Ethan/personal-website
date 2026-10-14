// bake 解析單測：dry-run 綠＋落地 JSON 形狀＋壞行 fail-closed（行號）。
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SCRIPT = join(ROOT, "scripts/sync-gmail.mjs");

function run(args: string[], env: Record<string, string> = {}): { code: number; out: string } {
  try {
    const out = execFileSync("node", [SCRIPT, ...args], {
      encoding: "utf-8",
      env: { ...process.env, ...env },
      timeout: 30000,
    });
    return { code: 0, out: String(out) };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: String(err.stdout ?? "") + String(err.stderr ?? "") };
  }
}

describe("sync-gmail bake", () => {
  it("dry-run 綠：三段皆有卡＋SKIP 明示行", () => {
    const r = run(["--dry-run"]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/study=30 invest=30 promo=17/);
    expect(r.out).toContain("SKIP");
  });
  it("落地 JSON 形狀：三主題齊／angle+claim 非空／link 全 http", () => {
    const doc = JSON.parse(readFileSync(join(ROOT, "src/features/workspace/core/gmail-digest.json"), "utf-8"));
    expect(doc.week).toBe("2026-W42");
    for (const t of ["study", "invest", "promo"]) {
      expect(doc.items.filter((i: { topic: string }) => i.topic === t).length).toBeGreaterThan(0);
    }
    for (const i of doc.items) {
      expect(["功用", "因果", "解決"]).toContain(i.angle);
      expect(i.claim.trim().length).toBeGreaterThan(0);
      if (i.link) expect(i.link).toMatch(/^https?:\/\//);
    }
  });
  it("壞行 fail-closed：無 angle 前綴 exit 非零並列行號", () => {
    const dir = mkdtempSync(join(tmpdir(), "gmail-bake-"));
    const bad1 = join(dir, "a.md");
    const bad2 = join(dir, "b.md");
    writeFileSync(bad1, "## 一、學習資訊\n\n- 沒前綴的壞行（2026-10-12，來源）\n");
    writeFileSync(bad2, "## 一、學習資訊\n\n- 【功用】好行（2026-10-12，來源）\n");
    const r = run(["--dry-run"], { GMAIL_IN1: bad1, GMAIL_IN2: bad2 });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/:3/); // 行號
    expect(r.out).toMatch(/前綴/);
  });
  it("附註段排除：附註 bullets 永不進 JSON", () => {
    const doc = JSON.parse(readFileSync(join(ROOT, "src/features/workspace/core/gmail-digest.json"), "utf-8"));
    const all = JSON.stringify(doc.items);
    expect(all).not.toContain("部署失敗");
    expect(all).not.toContain("Passkey");
  });
});

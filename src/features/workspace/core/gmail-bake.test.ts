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
    expect(r.out).toMatch(/study=22 invest=26 promo=18 flash=5/);
    expect(r.out).toContain("SKIP");
  });
  it("落地 JSON 形狀：三主題齊／angle+claim 非空／link 全 http／每段精選恰3", () => {
    const doc = JSON.parse(readFileSync(join(ROOT, "src/features/workspace/core/gmail-digest.json"), "utf-8"));
    expect(doc.week).toBe("2026-W42");
    expect(doc.weekRange).toBe("10/07–10/14");
    for (const t of ["study", "invest", "promo", "flash"]) {
      expect(doc.items.filter((i: { topic: string }) => i.topic === t).length).toBeGreaterThan(0);
      expect(doc.items.filter((i: { topic: string; featured?: boolean }) => i.topic === t && i.featured === true).length).toBe(3);
    }
    for (const i of doc.items) {
      expect(["功用", "因果", "解決", "資訊"]).toContain(i.angle);
      expect(i.claim.trim().length).toBeGreaterThan(0);
      if (i.link) expect(i.link).toMatch(/^https?:\/\//);
      for (const u of i.links || []) expect(u).toMatch(/^https?:\/\//);
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
  it("新文法隔離驗證：★資訊＋多連結 bake 綠", () => {
    const dir = mkdtempSync(join(tmpdir(), "gmail-bake-"));
    const topics = (star: boolean) => {
      const s = star ? "★" : "";
      return `## 二、投資（金融必連個股）\n\n- ${s}【因果】投精選一（2026-10-13，來源）\n- ${s}【因果】投精選二（2026-10-12，來源）\n- ${s}【因果】投精選三（2026-10-11，來源）\n\n## 三、本月促銷優惠（含時效）\n\n- ${s}【功用】促精選一（2026-10-10，來源）\n- ${s}【功用】促精選二（2026-10-09，來源）\n- ${s}【功用】促精選三（2026-10-08，來源）\n\n## 四、快訊\n\n- ${s}【資訊】快精選一（2026-10-07，來源）\n- ${s}【資訊】快精選二（2026-10-06，來源）\n- ${s}【資訊】快精選三（2026-10-05，來源）\n`;
    };
    const good1 = join(dir, "a.md");
    const good2 = join(dir, "b.md");
    // ★合計：study 3（兩檔合併算）、invest 3、promo 3、flash 3；多連結一條驗 links 全收
    writeFileSync(good1, `## 一、學習資訊\n\n- ★【資訊】學精選放假通知（2026-10-12，來源）\n- 【功用】學普通卡（2026-10-11，來源）— https://a.example/x ／ https://b.example/y\n\n${topics(true)}`);
    writeFileSync(good2, `## 一、學習資訊\n\n- ★【解決】學精選解法（2026-10-10，來源）\n- ★【因果】學精選三（2026-10-09，來源）\n\n${topics(false)}`);
    const r = run(["--dry-run"], { GMAIL_IN1: good1, GMAIL_IN2: good2 });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/study=4 invest=6 promo=6 flash=6/);
  });
});

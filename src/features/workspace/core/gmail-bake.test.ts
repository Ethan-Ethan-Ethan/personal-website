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
  it("落地 JSON 形狀：四段皆有卡／angle+claim 非空／link 全 http／全站【頂】恰4", () => {
    const doc = JSON.parse(readFileSync(join(ROOT, "src/features/workspace/core/gmail-digest.json"), "utf-8"));
    expect(doc.week).toBe("2026-W42");
    expect(doc.weekRange).toBe("10/07–10/14");
    for (const t of ["study", "invest", "promo", "flash"]) {
      expect(doc.items.filter((i: { topic: string }) => i.topic === t).length).toBeGreaterThan(0);
    }
    // 全站【頂】恰 4（★機制已廢，featured 殘留零容忍）
    expect(doc.items.filter((i: { top3?: boolean }) => i.top3 === true).length).toBe(4);
    expect(doc.items.some((i: { featured?: boolean }) => i.featured === true)).toBe(false);
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
  it("新文法隔離驗證：【頂】＋多連結 bake 綠，殘留★即失敗", () => {
    const dir = mkdtempSync(join(tmpdir(), "gmail-bake-"));
    const topics = () => {
      return `## 二、投資（金融必連個股）\n\n- 【因果】投普通一（2026-10-13，來源）\n- 【因果】投普通二（2026-10-12，來源）\n- 【因果】投普通三（2026-10-11，來源）\n\n## 三、本月促銷優惠（含時效）\n\n- 【功用】促普通一（2026-10-10，來源）\n- 【功用】促普通二（2026-10-09，來源）\n- 【功用】促普通三（2026-10-08，來源）\n\n## 四、快訊\n\n- 【資訊】快普通一（2026-10-07，來源）\n- 【資訊】快普通二（2026-10-06，來源）\n- 【資訊】快普通三（2026-10-05，來源）\n`;
    };
    const good1 = join(dir, "a.md");
    const good2 = join(dir, "b.md");
    // 【頂】合計恰 4（兩檔合併算）；多連結一條驗 links 全收
    writeFileSync(good1, `## 一、學習資訊\n\n- 【頂】【資訊】學頂放假通知（2026-10-12，來源）\n- 【功用】學普通卡（2026-10-11，來源）— https://a.example/x ／ https://b.example/y\n\n${topics()}`);
    writeFileSync(good2, `## 一、學習資訊\n\n- 【頂】【解決】學頂解法（2026-10-10，來源）\n- 【頂】【因果】學頂三（2026-10-09，來源）\n- 【頂】【功用】學頂四（2026-10-08，來源）\n\n${topics()}`);
    const r = run(["--dry-run"], { GMAIL_IN1: good1, GMAIL_IN2: good2 });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/study=5 invest=6 promo=6 flash=6/);
    // 殘留★即失敗（fail-closed，指回【頂】）
    const bad3 = join(dir, "c.md");
    const bad4 = join(dir, "d.md");
    writeFileSync(bad3, `## 一、學習資訊\n\n- ★【資訊】殘留星號（2026-10-12，來源）\n`);
    writeFileSync(bad4, `## 二、投資\n\n- 【因果】投普通（2026-10-13，來源）\n`);
    const r2 = run(["--dry-run"], { GMAIL_IN1: bad3, GMAIL_IN2: bad4 });
    expect(r2.code).not.toBe(0);
    expect(r2.out).toMatch(/★/);
  });
});

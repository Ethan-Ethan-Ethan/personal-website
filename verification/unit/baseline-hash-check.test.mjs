import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkBaselineHashes } from "../../scripts/baseline-hash-check.mjs";

describe("baseline hash binding (G4)", () => {
  it("passes the real manifest (files unmodified)", async () => {
    const result = await checkBaselineHashes();
    expect(result.ok).toBe(true);
    expect(result.files).toBeGreaterThan(0);
  });

  it("fails on a tampered file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "baseline-"));
    const { createHash } = await import("node:crypto");
    const good = Buffer.from("good-bytes");
    await writeFile(join(dir, "a.png"), good);
    const sha = createHash("sha256").update(good).digest("hex");
    await writeFile(
      join(dir, "manifest.json"),
      JSON.stringify({ baselines: [{ file: "a.png", sha256: sha }] })
    );
    await expect(checkBaselineHashes(join(dir, "manifest.json"))).resolves.toMatchObject({ ok: true });
    await writeFile(join(dir, "a.png"), Buffer.from("tampered-bytes"));
    await expect(checkBaselineHashes(join(dir, "manifest.json"))).rejects.toThrow(
      "baseline hash mismatch: a.png"
    );
  });

  it("rejects malformed manifests", async () => {
    const dir = await mkdtemp(join(tmpdir(), "baseline-"));
    await writeFile(join(dir, "m.json"), JSON.stringify({ baselines: [{ file: "a.png" }] }));
    await expect(checkBaselineHashes(join(dir, "m.json"))).rejects.toThrow("malformed entry");
  });
});

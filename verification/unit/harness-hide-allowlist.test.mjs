import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const SPEC = new URL("../e2e/visual-fusion.spec.ts", import.meta.url);
const ALLOWLIST = new URL("../harness-hide-allowlist.yaml", import.meta.url);
const HIDE = /display\s*:\s*none|visibility\s*:\s*hidden/i;
const MARKER = /TRIAL|ALLOWLIST/;

function findHides(source) {
  const lines = source.split("\n");
  const out = [];
  const re = /addStyleTag\(\{\s*content:\s*(`([^`]*)|'([^']*)'|"([^"]*)")/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const content = m[2] ?? m[3] ?? m[4] ?? "";
    if (!HIDE.test(content)) continue;
    const lineNo = source.slice(0, m.index).split("\n").length;
    const above = lines.slice(Math.max(0, lineNo - 6), lineNo - 1).join("\n");
    out.push({ lineNo, marked: MARKER.test(above), content });
  }
  return out;
}

describe("harness-hide allowlist (G3)", () => {
  it("allowlist entries are well-formed", async () => {
    const entries = parse(await readFile(ALLOWLIST, "utf8"));
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e.anchor, "anchor").toBeTruthy();
      expect(e.file, "file").toBeTruthy();
      expect(e.reason, "reason").toBeTruthy();
      expect(Boolean(e.expires) || Boolean(e.legacy), "expires|legacy").toBe(true);
    }
  });

  it("every test-side UI hide is marked and allowlisted", async () => {
    const source = await readFile(SPEC, "utf8");
    const entries = parse(await readFile(ALLOWLIST, "utf8"));
    const violations = [];
    for (const h of findHides(source)) {
      const listed = entries.some(
        (e) => e.file.endsWith("visual-fusion.spec.ts") && h.content.includes(e.anchor)
      );
      if (!h.marked || !listed) violations.push(h.lineNo);
    }
    expect(violations).toEqual([]);
  });

  it("bites on unlisted hides (red example, executable)", () => {
    const fake = `await page.addStyleTag({ content: '.shooting-star{display:none!important}' });`;
    expect(findHides(fake).length).toBe(1);
    expect(MARKER.test("// plain comment")).toBe(false);
  });
});

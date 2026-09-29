import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { bindRecipe, GRAY, HEXMAP } from "../../src/features/workspace/core/recipe-runtime-binding";

function parseFlatYaml(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Za-z_][\w]*):\s*"([^"]*)"/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

describe("bindRecipe", () => {
  it("maps palette via hex table file (TS mirror == yaml canonical)", () => {
    const yamlText = fs.readFileSync(
      path.join(__dirname, "..", "contracts", "palette-hex-map.v1.yaml"),
      "utf-8"
    );
    const table = parseFlatYaml(yamlText);
    for (const [k, v] of Object.entries(HEXMAP)) {
      if (k === "_default") continue;
      expect(table[k]).toBe(v);
    }
    const r = bindRecipe({ scene: { id: "s1" }, visual: { palette: ["dark_cool"], hotspot: [] }, motion: { loop: false } });
    expect(r.cssVars.length).toBeGreaterThan(0);
    expect(r.cssVars[0]).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(r.cssVars[0]).toBe(table["dark_cool"]);
  });
  it("unknown downgrades to static with gray fallback", () => {
    const r = bindRecipe({ scene: { id: "" }, visual: { palette: ["UNKNOWN"], hotspot: [] }, motion: {} });
    expect(r.staticFallback).toBe(true);
    expect(r.cssVars[0]).toBe(GRAY);
  });
  it("provenance contract exists", () => {
    const t = fs.readFileSync(
      path.join(__dirname, "..", "contracts", "assets-provenance.v1.yaml"),
      "utf-8"
    );
    expect(t).toMatch(/assetHash/);
  });
});

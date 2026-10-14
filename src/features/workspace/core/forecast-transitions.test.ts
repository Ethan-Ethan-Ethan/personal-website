// @vitest-environment node
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.join(__dirname, "..", "elements");
const CORE = __dirname;

function read(f: string): string {
  return fs.readFileSync(path.join(SRC, f), "utf-8");
}

describe("forecast transition single source", () => {
  it("defines .fc-node base exactly once across components", () => {
    const hits: string[] = [];
    for (const f of ["ForecastSideRail.tsx", "ForecastGlass.tsx"]) {
      const n = read(f).split(".fc-node{opacity:0").length - 1;
      if (n > 0) hits.push(`${f}×${n}`);
    }
    expect(hits).toEqual([]);
  });
  it("both components reference the shared module", () => {
    for (const f of ["ForecastSideRail.tsx", "ForecastGlass.tsx"]) {
      expect(read(f)).toContain("FC_TRANSITION_CSS");
    }
    expect(fs.readFileSync(path.join(CORE, "forecast-transitions.ts"), "utf-8")).toContain(
      ".fc-node.is-open"
    );
  });
});

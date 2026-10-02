import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { checkNBudgetEntries, verifyNBudget } from "../../scripts/n-budget-check.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

describe("n-budget gate (G2, standalone)", () => {
  it("passes entries within budget", () => {
    expect(checkNBudgetEntries([{ case: "a", n: 3, used: 3, status: "closed" }])).toEqual([]);
  });

  it("names offenders over budget", () => {
    expect(() => checkNBudgetEntries([{ case: "b", n: 1, used: 2, status: "open" }])).toThrow(
      "n-budget exceeded: b (used 2 > N 1)"
    );
  });

  it("rejects malformed entries", () => {
    expect(() => checkNBudgetEntries([{ case: "c" }])).toThrow("malformed entry");
    expect(() => checkNBudgetEntries({})).toThrow("must be a list");
  });

  it("passes the real registry (nebula-trial closed at budget)", async () => {
    const result = await verifyNBudget(ROOT);
    expect(result.ok).toBe(true);
    expect(result.cases).toBeGreaterThan(0);
  });

  it("fails closed on a missing registry", async () => {
    await expect(verifyNBudget(ROOT, "/nonexistent/n-budget.yaml")).rejects.toThrow(
      "registry missing"
    );
  });
});

import { describe, expect, it } from "vitest";
import { sortArticleCatalog } from "./article-catalog";

describe("article-catalog", () => {
  it("sorts pinned first then by date descending", () => {
    const sorted = sortArticleCatalog([
      { title: "old pin", href: "/a", date: "2026-10-18", category: "筆記", summary: "", pinned: true, cards: [] },
      { title: "new", href: "/b", date: "2026-10-21", category: "筆記", summary: "", pinned: false, cards: [] },
      { title: "new pin", href: "/c", date: "2026-10-20", category: "筆記", summary: "", pinned: true, cards: [] },
    ]);
    expect(sorted.map((e) => e.href)).toEqual(["/c", "/a", "/b"]);
  });
});

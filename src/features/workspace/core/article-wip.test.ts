import { describe, expect, it } from "vitest";
import { WIP_NOTES, wipBySlug, wipHref } from "./article-wip";
import { ARTICLE_FEATURE } from "./article-feature";

describe("article WIP notes", () => {
  it("has unique slugs and six diary links", () => {
    const slugs = WIP_NOTES.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(6);
    expect(wipBySlug("llm-word-puzzle")?.title).toContain("文字拼圖");
    expect(wipHref("simple-over-fancy-ai")).toBe("/wip/simple-over-fancy-ai");
  });

  it("every related card link points at a registered WIP slug", () => {
    const hrefs = ARTICLE_FEATURE.cards.flatMap((c) => c.related ?? []).map((r) => r.href);
    expect(hrefs).toHaveLength(6);
    for (const href of hrefs) {
      const slug = href.replace("/wip/", "");
      expect(wipBySlug(slug)).toBeTruthy();
    }
  });
});

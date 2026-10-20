import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WIP_NOTES, wipBySlug, wipHref } from "./article-wip";

const POSTS_DIR = join(import.meta.dirname, "../../../content/posts");
const WIP_LINK = /\/wip\/([a-z0-9-]+)/g;

function wipSlugsInMarkdownFiles(): string[] {
  const slugs: string[] = [];
  for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(POSTS_DIR, file), "utf8");
    for (const match of text.matchAll(WIP_LINK)) slugs.push(match[1]);
  }
  return slugs;
}

describe("article WIP notes", () => {
  it("has unique slugs", () => {
    const slugs = WIP_NOTES.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(wipBySlug("llm-word-puzzle")?.title).toContain("文字拼圖");
    expect(wipHref("simple-over-fancy-ai")).toBe("/wip/simple-over-fancy-ai");
  });

  it("every /wip/ link in published posts is registered (建構中路由)", () => {
    for (const slug of wipSlugsInMarkdownFiles()) {
      expect(wipBySlug(slug), `unregistered wip slug: ${slug}`).toBeTruthy();
    }
  });
});

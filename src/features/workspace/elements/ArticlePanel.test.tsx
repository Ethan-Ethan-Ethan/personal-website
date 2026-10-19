// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ArticlePanel from "./ArticlePanel";
import { ARTICLE_FEATURE } from "../core/article-feature";

afterEach(() => cleanup());

describe("ArticlePanel", () => {
  it("renders featured essay cards from 2026-10-18 note", () => {
    render(<ArticlePanel open onClose={() => {}} />);
    expect(screen.getByText(ARTICLE_FEATURE.chip)).toBeTruthy();
    expect(screen.getByTestId("article-title").textContent).toBe(ARTICLE_FEATURE.title);
    expect(screen.getByTestId("article-featured").textContent).toContain("Harness 才是整台車");
    const cards = screen.getAllByTestId("article-card");
    expect(cards).toHaveLength(4);
    expect(screen.getByRole("link", { name: "閱讀全文 →" }).getAttribute("href")).toBe(
      "/articles/harness-not-claude",
    );
    const loop = screen.getByRole("link", { name: "你需要的不是更多 Skill，而是更好的 Loop" });
    expect(loop.getAttribute("href")).toBe("/wip/better-loop-not-more-skills");
    expect(screen.getAllByTestId("article-related")).toHaveLength(3);
  });

  it("featured card uses the same type scale as Gmail top cards", () => {
    render(<ArticlePanel open onClose={() => {}} />);
    const p = screen.getByTestId("article-featured").querySelector("p");
    expect(p?.style.fontSize).toBe("17px");
    expect(p?.style.fontWeight).toBe("600");
    expect(p?.style.letterSpacing).toBe("0.05em");
  });
});

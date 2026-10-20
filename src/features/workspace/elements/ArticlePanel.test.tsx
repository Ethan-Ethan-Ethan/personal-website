// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ArticlePanel from "./ArticlePanel";
import { ARTICLE_FEATURE } from "../core/article-feature";

afterEach(() => cleanup());

describe("ArticlePanel", () => {
  it("starts with a title card and opens the essay layout on click", () => {
    render(<ArticlePanel open onClose={() => {}} />);
    expect(screen.getByText(ARTICLE_FEATURE.chip)).toBeTruthy();
    expect(screen.getByTestId("article-title").textContent).toBe(ARTICLE_FEATURE.title);
    expect(screen.queryByTestId("article-featured")).toBeNull();
    expect(screen.queryByTestId("article-card")).toBeNull();

    fireEvent.click(screen.getByTestId("article-title-card"));
    expect(screen.getByTestId("article-featured").textContent).toContain("螺絲起子");
    expect(screen.getAllByTestId("article-card")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "閱讀全文 →" }).getAttribute("href")).toBe(
      "/articles/rag-not-mandatory",
    );
    expect(screen.getByRole("button", { name: "返回文章列表" })).toBeTruthy();
    const graph = screen.getByRole("link", { name: "讓所有 Agent 共用同一份專案知識：你只需要接線與知識圖譜" });
    expect(graph.getAttribute("href")).toBe("/wip/shared-knowledge-graph");
    expect(screen.getAllByTestId("article-related")).toHaveLength(1);
  });

  it("returns from the essay layout to the title card", () => {
    render(<ArticlePanel open onClose={() => {}} />);
    fireEvent.click(screen.getByTestId("article-title-card"));
    fireEvent.click(screen.getByRole("button", { name: "返回文章列表" }));
    expect(screen.getByTestId("article-title-card")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "閱讀全文 →" })).toBeNull();
  });

  it("featured card uses the same type scale as Gmail top cards", () => {
    render(<ArticlePanel open onClose={() => {}} />);
    fireEvent.click(screen.getByTestId("article-title-card"));
    const p = screen.getByTestId("article-featured").querySelector("p");
    expect(p?.style.fontSize).toBe("17px");
    expect(p?.style.fontWeight).toBe("600");
    expect(p?.style.letterSpacing).toBe("0.05em");
  });
});

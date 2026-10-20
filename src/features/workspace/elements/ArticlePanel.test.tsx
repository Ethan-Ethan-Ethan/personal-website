// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ArticlePanel from "./ArticlePanel";
import type { ArticleCatalogEntry } from "../core/article-catalog";

const CATALOG: ArticleCatalogEntry[] = [
  {
    title: "不使用 Claude 的三大理由：你需要的不是更強的模型，而是更好的 Harness",
    href: "/articles/harness-not-claude",
    date: "2026-10-18",
    category: "公開筆記",
    summary: "模型是引擎，Harness 才是整台車。",
    pinned: true,
  },
  {
    title: "RAG 是公司必備嗎？我看未必。",
    href: "/articles/rag-not-mandatory",
    date: "2026-10-21",
    category: "公開筆記",
    summary: "懂 RAG 是專業，不懂就判死刑是傲慢。",
    pinned: false,
  },
];

afterEach(() => cleanup());

describe("ArticlePanel", () => {
  it("lists all notes with pinned badge on list view", () => {
    render(<ArticlePanel open onClose={() => {}} articles={CATALOG} />);
    expect(screen.getAllByTestId("article-list-item")).toHaveLength(2);
    expect(screen.getByText("置頂")).toBeTruthy();
    expect(screen.getByText(CATALOG[1].title)).toBeTruthy();
  });

  it("opens detail and links to full article", () => {
    render(<ArticlePanel open onClose={() => {}} articles={CATALOG} />);
    fireEvent.click(screen.getByRole("button", { name: /Harness/ }));
    expect(screen.getByTestId("article-featured").textContent).toContain("Harness");
    expect(screen.getByRole("link", { name: "閱讀全文 →" }).getAttribute("href")).toBe(
      "/articles/harness-not-claude",
    );
  });

  it("returns to list from detail", () => {
    render(<ArticlePanel open onClose={() => {}} articles={CATALOG} />);
    fireEvent.click(screen.getByRole("button", { name: /RAG/ }));
    fireEvent.click(screen.getByRole("button", { name: "返回筆記列表" }));
    expect(screen.getAllByTestId("article-list-item")).toHaveLength(2);
  });
});

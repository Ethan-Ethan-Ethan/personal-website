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
    cards: [
      { index: "01", title: "小節一", body: "正文一", related: [{ title: "延伸", href: "/wip/x" }] },
    ],
  },
  {
    title: "RAG 是公司必備嗎？我看未必。",
    href: "/articles/rag-not-mandatory",
    date: "2026-10-21",
    category: "公開筆記",
    summary: "懂 RAG 是專業，不懂就判死刑是傲慢。",
    pinned: false,
    intro: "開場段落",
    cards: [{ index: "01", title: "結論", body: "正文" }],
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

  it("opens inline full note with featured, cards, and related links", () => {
    render(<ArticlePanel open onClose={() => {}} articles={CATALOG} />);
    fireEvent.click(screen.getByRole("button", { name: /Harness/ }));
    expect(screen.getByTestId("article-featured").textContent).toContain("Harness");
    expect(screen.getAllByTestId("article-card")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "延伸" }).getAttribute("href")).toBe("/wip/x");
    expect(screen.queryByRole("link", { name: /閱讀全文/ })).toBeNull();
  });

  it("returns to list from detail", () => {
    render(<ArticlePanel open onClose={() => {}} articles={CATALOG} />);
    fireEvent.click(screen.getByRole("button", { name: /RAG/ }));
    fireEvent.click(screen.getByRole("button", { name: "返回筆記列表" }));
    expect(screen.getAllByTestId("article-list-item")).toHaveLength(2);
  });
});

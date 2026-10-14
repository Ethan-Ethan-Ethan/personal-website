// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GmailPanel, { isExpired } from "./GmailPanel";
import digest from "../core/gmail-digest.json";

afterEach(() => cleanup());

describe("GmailPanel", () => {
  it("renders header plus three fixed sections with angle+claim cards", () => {
    render(<GmailPanel open />);
    expect(screen.getByText((_, el) => el?.textContent === "本週重點 2026-W42")).toBeTruthy();
    expect(screen.getByText("Gmail 整理專案")).toBeTruthy();
    for (const label of ["學習資訊", "投資", "本月促銷優惠"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    // 每卡 angle＋claim 非空：抽查三段各一卡
    expect(screen.getByLabelText(/因果：.*Haiku/)).toBeTruthy();
    expect(screen.getAllByLabelText(/因果：.*德宏/).length).toBe(2); // 週報＋bnext 各一卡
    expect(screen.getByLabelText(/因果：.*Ashampoo/)).toBeTruthy();
    // link 缺時不編造：無 link 卡不掛原文連結
    const noLinkCard = screen.getByLabelText(/ROHM 高壓電壓檢測/);
    expect(noLinkCard.textContent).not.toContain("原文連結");
    const linkCard = screen.getByLabelText(/Snipboard/);
    expect(linkCard.textContent).toContain("原文連結");
  });
  it("shows honest empty state when snapshot is missing or shapeless", () => {
    const { unmount } = render(<GmailPanel open digest={null} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
    expect(screen.queryByText("學習資訊")).toBeNull();
    unmount();
    render(<GmailPanel open digest={{ _generated: "x", week: "2026-W42", sources: [], items: [] }} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
  });
  it("grays out expired promos without deleting them", () => {
    expect(isExpired("10/25 前", new Date(2026, 9, 26))).toBe(true);
    expect(isExpired("10/25 前", new Date(2026, 9, 20))).toBe(false);
    expect(isExpired(undefined)).toBe(false);
    expect(isExpired("限定 3 天", new Date(2027, 0, 1))).toBe(false);
    render(
      <GmailPanel
        open
        digest={{
          _generated: "t",
          week: "2026-W42",
          sources: [],
          items: [
            { topic: "study", angle: "功用", claim: "學卡", date: "2026-10-12", source: "s" },
            { topic: "invest", angle: "因果", claim: "投卡", date: "2026-10-13", source: "s" },
            { topic: "promo", angle: "因果", claim: "過期卡", date: "2026-09-01", source: "s", expiry: "9/30 前" },
          ],
        }}
      />
    );
    expect(screen.getByText("已過期")).toBeTruthy();
    expect(screen.getByLabelText(/過期卡/)).toBeTruthy();
  });
  it("baked snapshot itself passes shape gate", () => {
    const d = digest as unknown as { week: string; items: { topic: string; angle: string; claim: string; link?: string }[] };
    for (const t of ["study", "invest", "promo"]) {
      expect(d.items.some((i) => i.topic === t)).toBe(true);
    }
    for (const i of d.items) {
      expect(["功用", "因果", "解決"]).toContain(i.angle);
      expect(i.claim.trim().length).toBeGreaterThan(0);
      if (i.link) expect(i.link).toMatch(/^https?:\/\//);
    }
  });
});

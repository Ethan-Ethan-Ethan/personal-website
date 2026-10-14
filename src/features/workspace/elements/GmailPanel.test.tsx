// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import GmailPanel, { cardLinks, expiryKey, isExpired } from "./GmailPanel";
import digest from "../core/gmail-digest.json";

afterEach(() => cleanup());

describe("GmailPanel", () => {
  it("renders header plus three fixed sections with claim cards (no angle pills)", () => {
    render(<GmailPanel open />);
    expect(screen.getByText((_, el) => el?.textContent === "本週重點 2026-W42")).toBeTruthy();
    expect(screen.getByText("Gmail 整理專案")).toBeTruthy();
    for (const label of ["學習資訊", "投資", "本月促銷優惠"]) {
      // 段標＋rail 精選 Top3 各一列
      expect(screen.getAllByText(label).length).toBe(2);
    }
    // angle 只留 JSON／bake，UI 不渲染徽：全表卡 aria 為 claim 精確匹配；精選卡另有 精選｜ 前綴
    expect(screen.getByLabelText('Claude Haiku 5.5 登場：比 Haiku 4.5 便宜約 75%，處理大量重複工作；Sonnet 5.5 快取讀取砍半')).toBeTruthy();
    expect(screen.getAllByLabelText(/德宏/).length).toBeGreaterThanOrEqual(1); // 合併後全表剩一卡＋精選一列
    expect(screen.getByLabelText('Ashampoo 27 週年：最高 85% off')).toBeTruthy();
    // 徽消失：UI 不渲染任何【angle】pill；忙人 chip 已刪
    expect(screen.queryByText(/【(功用|因果|解決|資訊)】/)).toBeNull();
    expect(screen.queryByText(/忙人只看/)).toBeNull();
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
  it("baked snapshot itself passes shape gate (4 angles, links http, stars 3 per topic)", () => {
    const d = digest as unknown as { week: string; items: { topic: string; angle: string; claim: string; link?: string; links?: string[]; featured?: boolean }[] };
    for (const t of ["study", "invest", "promo"]) {
      expect(d.items.some((i) => i.topic === t)).toBe(true);
      expect(d.items.filter((i) => i.topic === t && i.featured === true).length).toBe(3);
    }
    for (const i of d.items) {
      expect(["功用", "因果", "解決", "資訊"]).toContain(i.angle);
      expect(i.claim.trim().length).toBeGreaterThan(0);
      if (i.link) expect(i.link).toMatch(/^https?:\/\//);
      for (const u of i.links || []) expect(u).toMatch(/^https?:\/\//);
    }
  });
  it("renders featured zone, count chips, rail, and multi-link rows", () => {
    render(<GmailPanel open />);
    // 精選區：9 條（每段 ★3，Haiku 已搬 promo）
    expect(screen.getByText("精選")).toBeTruthy();
    expect(screen.queryByText(/忙人只看/)).toBeNull();
    expect(screen.getByLabelText(/精選｜.*Haiku/)).toBeTruthy();
    // 段標計數 chip（study 26／invest 27／promo 18）
    expect(screen.getByText("26 條")).toBeTruthy();
    expect(screen.getByText("27 條")).toBeTruthy();
    expect(screen.getByText("18 條")).toBeTruthy();
    // 右 rail：精選 Top3＋促銷時效榜
    const rail = screen.getByLabelText("重點側欄");
    expect(within(rail).getByText("精選 Top3")).toBeTruthy();
    expect(within(rail).getByText("促銷時效榜")).toBeTruthy();
    // 多連結列：Snipboard 兩連結渲染 原文連結1／2
    const snip = screen.getByLabelText(/Snipboard/);
    expect(snip.textContent).toContain("原文連結1");
    expect(snip.textContent).toContain("原文連結2");
    // 全表收合
    expect(screen.getAllByText(/看全表/).length).toBe(3);
  });
  it("cardLinks caps at 3 and expiryKey orders promos by date", () => {
    expect(cardLinks({ link: "https://a.example/" })).toEqual(["https://a.example/"]);
    expect(cardLinks({ link: "https://a.example/", links: ["https://a.example/", "https://b.example/", "https://c.example/", "https://d.example/"] }).length).toBe(3);
    expect(cardLinks({})).toEqual([]);
    expect(expiryKey({ expiry: "10/25 前" })).toBeLessThan(expiryKey({ expiry: "11/2" }));
    expect(expiryKey({ expiry: undefined })).toBe(9999);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import GmailPanel, { cardLinks, expiryKey, isExpired } from "./GmailPanel";
import digest from "../core/gmail-digest.json";

afterEach(() => cleanup());

describe("GmailPanel", () => {
  it("renders header plus four fixed sections with claim cards (no angle pills, no left featured)", () => {
    render(<GmailPanel open />);
    expect(screen.getByText((_, el) => el?.textContent === "本週重點 2026-W42 · 10/07–10/14")).toBeTruthy();
    expect(screen.getByText("Gmail 整理專案", { exact: false })).toBeTruthy();
    // 寫信給我：站內唯一公開郵箱，簡單 mailto 不帶參數
    const mail = screen.getByRole("link", { name: "寫信給我" });
    expect(mail.getAttribute("href")).toBe("mailto:isitoled@gmail.com");
    for (const label of ["學習", "投資", "本月促銷優惠", "快訊"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    // 左欄精選區已刪：無折疊、無精選卡
    expect(screen.queryByTestId("featured-fold")).toBeNull();
    expect(screen.queryByText(/精選（12 條）/)).toBeNull();
    expect(screen.queryAllByLabelText(/^精選｜/).length).toBe(0);
    // angle 只留 JSON／bake，UI 不渲染徽：全表卡 aria 為 claim 精確匹配；右欄卡另有 右欄精選｜ 前綴（預設收合不在 DOM）
    expect(screen.getByLabelText('Claude Haiku 5.5 登場：比 Haiku 4.5 便宜約 75%，處理大量重複工作；Sonnet 5.5 快取讀取砍半')).toBeTruthy();
    expect(screen.getAllByLabelText(/德宏/).length).toBeGreaterThanOrEqual(1); // 全表一卡（右欄收合不在 DOM）
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
    expect(screen.queryByText("學習")).toBeNull();
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
            { topic: "flash", angle: "資訊", claim: "快卡", date: "2026-10-14", source: "s" },
          ],
        }}
      />
    );
    expect(screen.getByText("已過期")).toBeTruthy();
    expect(screen.getByLabelText(/過期卡/)).toBeTruthy();
  });
  it("baked snapshot itself passes shape gate (4 angles, links http, stars 3 per topic)", () => {
    const d = digest as unknown as { week: string; items: { topic: string; angle: string; claim: string; link?: string; links?: string[]; featured?: boolean }[] };
    for (const t of ["study", "invest", "promo", "flash"]) {
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
  it("right rail feeds featured as four collapsible topic groups, left has no featured", () => {
    render(<GmailPanel open />);
    // 左欄無精選折疊
    expect(screen.queryByTestId("featured-fold")).toBeNull();
    expect(screen.queryByText(/忙人只看/)).toBeNull();
    // 段標計數 chip（study 22／invest 26／promo 18／flash 5）
    expect(screen.getByText("22 條")).toBeTruthy();
    expect(screen.getByText("26 條")).toBeTruthy();
    expect(screen.getByText("18 條")).toBeTruthy();
    expect(screen.getByText("5 條")).toBeTruthy();
    // 右 rail：精選 Top3 改四主題折疊＋促銷時效榜保留
    const rail = screen.getByLabelText("重點側欄");
    expect(within(rail).getByText("精選 Top3")).toBeTruthy();
    expect(within(rail).getByText("促銷時效榜")).toBeTruthy();
    const groups = screen.getAllByTestId(/rail-fold-/);
    expect(groups.length).toBe(4);
    // summary＝主題名＋計數，預設收合、卡片不在 DOM
    for (const [key, label] of [["study", "學習"], ["invest", "投資"], ["promo", "本月促銷優惠"], ["flash", "快訊"]] as const) {
      const g = screen.getByTestId(`rail-fold-${key}`);
      expect(g.tagName).toBe("DETAILS");
      expect(g.hasAttribute("open")).toBe(false);
      expect(within(rail).getByText(`${label}精選（3 條）`)).toBeTruthy();
    }
    expect(screen.queryAllByLabelText(/^右欄精選｜/).length).toBe(0);
    // 多連結列：Snipboard 全表卡兩連結渲染 原文連結1／2（收合前即查全表卡，避免展開後右欄卡重名）
    const snip = screen.getByLabelText(/Snipboard/);
    expect(snip.textContent).toContain("原文連結1");
    expect(snip.textContent).toContain("原文連結2");
    // 全表收合（既有邏輯不動）
    expect(screen.getAllByText(/看全表/).length).toBe(4);
  });
  it("rail topic groups expand to 3 star cards with claim+date/source+links (no link → source text only)", () => {
    render(<GmailPanel open />);
    const rail = screen.getByLabelText("重點側欄");
    const group = screen.getByTestId("rail-fold-invest");
    const summary = within(rail).getByText("投資精選（3 條）");
    expect(summary.tagName).toBe("SUMMARY");
    fireEvent.click(summary);
    expect(screen.getByTestId("rail-fold-invest").hasAttribute("open")).toBe(true);
    const cards = within(group).getAllByLabelText(/^右欄精選｜/);
    expect(cards.length).toBe(3);
    // 無 link 卡（封測）：顯日期來源文字，不編造原文連結
    const noLink = within(group).getByLabelText(/右欄精選｜封測史上最強漲價潮/);
    expect(noLink.textContent).toContain("2026-10-13");
    expect(noLink.textContent).toContain("見數位早報內文");
    expect(noLink.textContent).not.toContain("原文連結");
    // 有 link 卡（台積電）：渲染原文連結
    const linked = within(group).getByLabelText(/右欄精選｜台積電/);
    expect(linked.textContent).toContain("原文連結");
    // 其他三組仍收合
    for (const key of ["study", "promo", "flash"]) {
      expect(screen.getByTestId(`rail-fold-${key}`).hasAttribute("open")).toBe(false);
    }
  });
  it("cardLinks caps at 3 and expiryKey orders promos by date", () => {
    expect(cardLinks({ link: "https://a.example/" })).toEqual(["https://a.example/"]);
    expect(cardLinks({ link: "https://a.example/", links: ["https://a.example/", "https://b.example/", "https://c.example/", "https://d.example/"] }).length).toBe(3);
    expect(cardLinks({})).toEqual([]);
    expect(expiryKey({ expiry: "10/25 前" })).toBeLessThan(expiryKey({ expiry: "11/2" }));
    expect(expiryKey({ expiry: undefined })).toBe(9999);
  });
});

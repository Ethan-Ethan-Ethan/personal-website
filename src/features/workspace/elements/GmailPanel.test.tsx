// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import GmailPanel, { cardLinks, expiryKey, isExpired } from "./GmailPanel";
import digest from "../core/gmail-digest.json";

afterEach(() => cleanup());

describe("GmailPanel", () => {
  it("left column: header plus flat Top3 (no folding, no glass)", () => {
    render(<GmailPanel open />);
    expect(screen.getByText((_, el) => el?.textContent === "本週重點 2026-W42 · 10/07–10/14")).toBeTruthy();
    expect(screen.getByText("Gmail 整理專案", { exact: false })).toBeTruthy();
    // 寫信給我：站內唯一公開郵箱，簡單 mailto 不帶參數
    const mail = screen.getByRole("link", { name: "寫信給我" });
    expect(mail.getAttribute("href")).toBe("mailto:isitoled@gmail.com");
    // 左欄本週精選TOP3：平鋪三卡
    expect(screen.getByText("本週精選TOP3")).toBeTruthy();
    const flats = screen.getAllByTestId("top3-flat");
    expect(flats.length).toBe(3);
    // 左欄無折疊：section 內無 details／看全表
    const section = screen.getByLabelText("Gmail 本週重點");
    expect(within(section).queryAllByText(/看全表/).length).toBe(0);
    expect(within(section).queryByTestId("featured-fold")).toBeNull();
    // 平鋪卡無玻璃類：實底 rgba(0,0,0,0.45)、無 blur、白邊僅極細、圓角 16
    for (const card of flats) {
      expect(card.style.background).toBe("rgba(0, 0, 0, 0.45)");
      expect(card.style.backdropFilter).toBe("");
      expect(card.style.borderRadius).toBe("16px");
    }
    // 氣溫頁字體：claim 17px 600 白字＋CJK 0.05em 追蹤
    const claimP = flats[0].querySelector("p");
    expect(claimP?.textContent?.length).toBeGreaterThan(0);
    expect(claimP?.style.fontSize).toBe("17px");
    expect(claimP?.style.fontWeight).toBe("600");
    expect(claimP?.style.letterSpacing).toBe("0.05em");
    expect(claimP?.textContent?.length).toBeGreaterThan(0);
    // Top3 三條（worker 提案＋Ethan 終審）：HiNet／台積電／辦公日曆
    expect(screen.getByLabelText(/本週精選｜HiNet/)).toBeTruthy();
    expect(screen.getByLabelText(/本週精選｜台積電/)).toBeTruthy();
    expect(screen.getByLabelText(/本週精選｜2027 辦公日曆/)).toBeTruthy();
    // angle 只留 JSON／bake，UI 不渲染徽
    expect(screen.queryByText(/【(功用|因果|解決|資訊)】/)).toBeNull();
    expect(screen.queryByText(/【頂】/)).toBeNull();
  });
  it("shows honest empty state when snapshot is missing, shapeless, or top3 != 3", () => {
    const { unmount } = render(<GmailPanel open digest={null} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
    expect(screen.queryByText("本週精選TOP3")).toBeNull();
    unmount();
    render(<GmailPanel open digest={{ _generated: "x", week: "2026-W42", sources: [], items: [] }} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
    cleanup();
    // 四段齊但無【頂】→空態（【頂】恰 3 門）
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
            { topic: "promo", angle: "因果", claim: "促卡", date: "2026-10-11", source: "s" },
            { topic: "flash", angle: "資訊", claim: "快卡", date: "2026-10-14", source: "s" },
          ],
        }}
      />
    );
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
            { topic: "study", angle: "功用", claim: "學卡", date: "2026-10-12", source: "s", top3: true },
            { topic: "invest", angle: "因果", claim: "投卡", date: "2026-10-13", source: "s", top3: true },
            { topic: "promo", angle: "因果", claim: "過期卡", date: "2026-09-01", source: "s", expiry: "9/30 前", top3: true },
            { topic: "flash", angle: "資訊", claim: "快卡", date: "2026-10-14", source: "s" },
          ],
        }}
      />
    );
    expect(screen.getByText("已過期")).toBeTruthy();
    // 過期卡同時在左欄 Top3（本週精選｜前綴）與右欄全表（精確匹配）各一卡
    expect(screen.getAllByLabelText(/過期卡/).length).toBe(2);
  });
  it("baked snapshot itself passes shape gate (4 topics, top3 exactly 3 site-wide, no featured)", () => {
    const d = digest as unknown as { week: string; items: { topic: string; angle: string; claim: string; link?: string; links?: string[]; top3?: boolean; featured?: boolean }[] };
    for (const t of ["study", "invest", "promo", "flash"]) {
      expect(d.items.some((i) => i.topic === t)).toBe(true);
    }
    // 全站【頂】恰 3（★機制已廢，featured 殘留零容忍）
    expect(d.items.filter((i) => i.top3 === true).length).toBe(3);
    expect(d.items.some((i) => i.featured === true)).toBe(false);
    for (const i of d.items) {
      expect(["功用", "因果", "解決", "資訊"]).toContain(i.angle);
      expect(i.claim.trim().length).toBeGreaterThan(0);
      if (i.link) expect(i.link).toMatch(/^https?:\/\//);
      for (const u of i.links || []) expect(u).toMatch(/^https?:\/\//);
    }
  });
  it("right rail holds four full-table folds (glass cards); expiry board and rail Top3 gone", () => {
    render(<GmailPanel open />);
    // 段標計數 chip（study 22／invest 26／promo 18／flash 5）
    expect(screen.getByText("22 條")).toBeTruthy();
    expect(screen.getByText("26 條")).toBeTruthy();
    expect(screen.getByText("18 條")).toBeTruthy();
    expect(screen.getByText("5 條")).toBeTruthy();
    // 右 rail：四組看全表；舊精選 Top3 盒＋促銷時效榜刪除
    const rail = screen.getByLabelText("重點側欄");
    expect(within(rail).queryByText("精選 Top3")).toBeNull();
    expect(within(rail).queryByText("促銷時效榜")).toBeNull();
    expect(screen.queryByTestId(/rail-fold-/)).toBeNull();
    const groups = screen.getAllByTestId(/rail-full-/);
    expect(groups.length).toBe(4);
    // summary＝看全表＋計數，預設收合
    for (const [key, n] of [["study", 22], ["invest", 26], ["promo", 18], ["flash", 5]] as const) {
      const g = screen.getByTestId(`rail-full-${key}`);
      expect(g.tagName).toBe("DETAILS");
      expect(g.hasAttribute("open")).toBe(false);
      expect(within(g as HTMLElement).getByText(`看全表（${n} 條）`)).toBeTruthy();
    }
    expect(within(rail).getAllByText(/看全表/).length).toBe(4);
    // 全表卡 aria＝claim 精確匹配（與左欄 本週精選｜ 前綴不重名）
    expect(screen.getByLabelText('Claude Haiku 5.5 登場：比 Haiku 4.5 便宜約 75%，處理大量重複工作；Sonnet 5.5 快取讀取砍半')).toBeTruthy();
    // link 缺時不編造：無 link 卡不掛原文連結
    const noLinkCard = screen.getByLabelText(/ROHM 高壓電壓檢測/);
    expect(noLinkCard.textContent).not.toContain("原文連結");
    const linkCard = screen.getByLabelText(/Snipboard/);
    expect(linkCard.textContent).toContain("原文連結");
    // 多連結列：Snipboard 全表卡兩連結渲染 原文連結1／2
    expect(linkCard.textContent).toContain("原文連結1");
    expect(linkCard.textContent).toContain("原文連結2");
    // 右欄全表卡保留玻璃類（details 內卡片有 blur 底）
    const glassCard = noLinkCard;
    expect(glassCard.style.backdropFilter).toContain("blur");
  });
  it("cardLinks caps at 3 and expiryKey orders promos by date", () => {
    expect(cardLinks({ link: "https://a.example/" })).toEqual(["https://a.example/"]);
    expect(cardLinks({ link: "https://a.example/", links: ["https://a.example/", "https://b.example/", "https://c.example/", "https://d.example/"] }).length).toBe(3);
    expect(cardLinks({})).toEqual([]);
    expect(expiryKey({ expiry: "10/25 前" })).toBeLessThan(expiryKey({ expiry: "11/2" }));
    expect(expiryKey({ expiry: undefined })).toBe(9999);
  });
});

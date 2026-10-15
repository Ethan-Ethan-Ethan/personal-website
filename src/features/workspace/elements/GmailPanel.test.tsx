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
    // 左欄本週精選TOP4：平鋪四卡
    expect(screen.getByText("本週精選TOP4")).toBeTruthy();
    const flats = screen.getAllByTestId("top3-flat");
    expect(flats.length).toBe(4);
    // 主欄無折疊：section 內 4 組看全表全歸右欄（主欄零折疊；rail 已嵌進 section 內）
    const section = screen.getByLabelText("Gmail 本週重點");
    const railInSection = within(section).getByLabelText("重點側欄");
    expect(within(section).getAllByText(/看全表/).length).toBe(4);
    expect(within(railInSection).getAllByText(/看全表/).length).toBe(4);
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
    // Top4 四條（worker 提案＋Ethan 終審）：隱私9防線／台積電／Gemini免費領／辦公日曆
    expect(screen.getByLabelText(/本週精選｜.*隱私防線/)).toBeTruthy();
    expect(screen.getByLabelText(/本週精選｜台積電/)).toBeTruthy();
    expect(screen.getByLabelText(/本週精選｜免費領 Gemini/)).toBeTruthy();
    expect(screen.getByLabelText(/本週精選｜2027 辦公日曆/)).toBeTruthy();
    // angle 只留 JSON／bake，UI 不渲染徽
    expect(screen.queryByText(/【(功用|因果|解決|資訊)】/)).toBeNull();
    expect(screen.queryByText(/【頂】/)).toBeNull();
  });
  it("shows honest empty state when snapshot is missing, shapeless, or top3 != 4", () => {
    const { unmount } = render(<GmailPanel open digest={null} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
    expect(screen.queryByText("本週精選TOP4")).toBeNull();
    unmount();
    render(<GmailPanel open digest={{ _generated: "x", week: "2026-W42", sources: [], items: [] }} />);
    expect(screen.getByText("本週重點尚未 bake")).toBeTruthy();
    cleanup();
    // 四段齊但無【頂】→空態（【頂】恰 4 門）
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
            { topic: "flash", angle: "資訊", claim: "快卡", date: "2026-10-14", source: "s", top3: true },
          ],
        }}
      />
    );
    expect(screen.getByText("已過期")).toBeTruthy();
    // 過期卡同時在左欄 Top3（本週精選｜前綴）與右欄全表（精確匹配）各一卡
    expect(screen.getAllByLabelText(/過期卡/).length).toBe(2);
  });
  it("baked snapshot itself passes shape gate (4 topics, top3 exactly 4 site-wide, no featured)", () => {
    const d = digest as unknown as { week: string; items: { topic: string; angle: string; claim: string; link?: string; links?: string[]; top3?: boolean; featured?: boolean }[] };
    for (const t of ["study", "invest", "promo", "flash"]) {
      expect(d.items.some((i) => i.topic === t)).toBe(true);
    }
    // 全站【頂】恰 4（★機制已廢，featured 殘留零容忍）
    expect(d.items.filter((i) => i.top3 === true).length).toBe(4);
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
    // 段標計數 chip（study 22／invest 26／promo 17／flash 5）
    expect(screen.getByText("22 條")).toBeTruthy();
    expect(screen.getByText("26 條")).toBeTruthy();
    expect(screen.getByText("17 條")).toBeTruthy();
    expect(screen.getByText("5 條")).toBeTruthy();
    // 右 rail：四組看全表；舊精選 Top3 盒＋促銷時效榜刪除
    const rail = screen.getByLabelText("重點側欄");
    expect(within(rail).queryByText("精選 Top3")).toBeNull();
    expect(within(rail).queryByText("促銷時效榜")).toBeNull();
    expect(screen.queryByTestId(/rail-fold-/)).toBeNull();
    const groups = screen.getAllByTestId(/rail-full-/);
    expect(groups.length).toBe(4);
    // summary＝看全表＋計數，預設收合
    for (const [key, n] of [["study", 22], ["invest", 26], ["promo", 17], ["flash", 5]] as const) {
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
  it("entrance stagger mirrors ForecastGlass (chip wipe → title → 精選 x4 → rail x4; closed collapses to 0ms)", () => {
    render(<GmailPanel open />);
    // header chip wipe 100ms
    const head = screen.getByTestId("gmail-head");
    expect(head.className).toContain("fc-wipe-r");
    expect(head.className).toContain("is-open");
    expect((head as HTMLElement).style.transitionDelay).toBe("100ms");
    // 標題 200ms
    const title = screen.getByTestId("gmail-title");
    expect(title.className).toContain("fc-dir-l");
    expect(title.className).toContain("is-open");
    expect((title as HTMLElement).style.transitionDelay).toBe("200ms");
    // 精選只認數量：恰 4 卡 stagger 300／370／440／510（名單圈選中，不寫死內容）
    const flats = screen.getAllByTestId("top3-flat");
    expect(flats.length).toBe(4);
    expect(flats.map((c) => (c as HTMLElement).style.transitionDelay)).toEqual(["300ms", "370ms", "440ms", "510ms"]);
    for (const c of flats) expect(c.className).toContain("is-open");
    // 右欄四組 dir-r stagger 400＋i*70（study／invest／promo／flash 順）
    const groups = screen.getAllByTestId(/rail-full-/);
    expect(groups.length).toBe(4);
    groups.forEach((g, i) => {
      const box = (g as HTMLElement).closest(".fc-node") as HTMLElement;
      expect(box.className).toContain("fc-dir-r");
      expect(box.className).toContain("is-open");
      expect(box.style.transitionDelay).toBe(`${400 + i * 70}ms`);
    });
    cleanup();
    // 關閉一律 0ms 同收
    render(<GmailPanel open={false} />);
    expect(screen.getByTestId("gmail-head").className).not.toContain("is-open");
    expect((screen.getByTestId("gmail-head") as HTMLElement).style.transitionDelay).toBe("0ms");
    expect((screen.getByTestId("gmail-title") as HTMLElement).style.transitionDelay).toBe("0ms");
    for (const c of screen.getAllByTestId("top3-flat")) {
      expect((c as HTMLElement).style.transitionDelay).toBe("0ms");
    }
    for (const g of screen.getAllByTestId(/rail-full-/)) {
      expect(((g as HTMLElement).closest(".fc-node") as HTMLElement).style.transitionDelay).toBe("0ms");
    }
  });
  it("mobile media: panel height wins over inline 72vh; cards darken (desktop inline untouched)", () => {
    render(<GmailPanel open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    // ① 高度：media 內 max-height:52vh 帶 !important（壓過 inline 72vh；Ego 實測 607px 撞底部播放器）
    expect(css).toContain("max-height:52vh !important");
    // inline 數值不動（只加 media 權重）
    expect((screen.getByLabelText("Gmail 本週重點") as HTMLElement).style.maxHeight).toBe("72vh");
    // ② 好讀：加深規則落在 ≤900px media 內（桌機外無此規則）
    const mediaAt = css.indexOf("@media (max-width: 900px)");
    const top3At = css.indexOf(".gmail-top3-card{background:rgba(0,0,0,0.62) !important");
    const fullAt = css.indexOf(".gmail-full-card{background:rgba(255,255,255,0.16) !important");
    expect(mediaAt).toBeGreaterThanOrEqual(0);
    expect(top3At).toBeGreaterThan(mediaAt);
    expect(fullAt).toBeGreaterThan(mediaAt);
    // ③ 桌機 inline 不動（TOP3 0.45 實底沿用）
    for (const card of screen.getAllByTestId("top3-flat")) {
      expect((card as HTMLElement).style.background).toBe("rgba(0, 0, 0, 0.45)");
    }
  });
  it("mobile stacking fix: rail nested in section after main flow; desktop coords unchanged", () => {
    render(<GmailPanel open />);
    const section = screen.getByLabelText("Gmail 本週重點") as HTMLElement;
    // rail 在 section 內、主欄之後（DOM 尾）：Top3 四卡皆先於 rail，
    // 手機 static 自然接在主欄之後，進同一 52vh 捲動流（根因：兄弟節點 static 流入 overlay 頂部交疊）
    const rail = within(section).getByLabelText("重點側欄") as HTMLElement;
    const flats = within(section).getAllByTestId("top3-flat");
    expect(flats.length).toBe(4);
    for (const c of flats) {
      expect(c.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(section.lastElementChild).toBe(rail);
    // 桌機座標不變（沿既有 inline 斷言語式）：top 12%／right 38／寬 300／80vh 捲動
    expect(rail.style.top).toBe("12%");
    expect(rail.style.right).toBe("38px");
    expect(rail.style.width).toBe("300px");
    expect(rail.style.maxHeight).toBe("80vh");
    // fixed 而非 absolute：section 已 positioned，absolute 會以面板為 containing block 交疊桌機；
    // landing root fixed inset:0 且無 transform 祖先，fixed 與 overlay 座標系重合，像素一致
    expect(rail.style.position).toBe("fixed");
    // 手機 media：rail static 接流（margin 去側縮，與主欄全幅對齊）
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    const mediaAt = css.indexOf("@media (max-width: 900px)");
    const railAt = css.indexOf(".gmail-rail{position:static !important");
    expect(railAt).toBeGreaterThan(mediaAt);
    expect(css).toContain("margin:16px 0 0 !important");
  });
  it("cardLinks caps at 3 and expiryKey orders promos by date", () => {
    expect(cardLinks({ link: "https://a.example/" })).toEqual(["https://a.example/"]);
    expect(cardLinks({ link: "https://a.example/", links: ["https://a.example/", "https://b.example/", "https://c.example/", "https://d.example/"] }).length).toBe(3);
    expect(cardLinks({})).toEqual([]);
    expect(expiryKey({ expiry: "10/25 前" })).toBeLessThan(expiryKey({ expiry: "11/2" }));
    expect(expiryKey({ expiry: undefined })).toBe(9999);
  });
});

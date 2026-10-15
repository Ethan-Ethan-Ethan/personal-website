// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HEXMAP } from "../core/recipe-runtime-binding";
import { LAKE_PHASES } from "../core/lake-palette";
import LakeOverlay from "./LakeOverlay";

afterEach(() => cleanup());

// SplitText 拉起 gsap＋ScrollTrigger（import 期即呼叫 matchMedia，盖不住）：
// 房子測試與逐字動畫無關，直接 mock 掉。
vi.mock("../../../components/reactbits/SplitText", () => ({
  default: () => null,
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn(() => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })),
    configurable: true,
  });
});

const props = {
  phase: LAKE_PHASES[0],
  phaseIndex: 0,
  phaseCount: LAKE_PHASES.length,
  goTo: () => {},
  trackPlaying: false,
  onTogglePlay: () => {},
};

describe("LakeOverlay house button", () => {
  it("uses palette forecast_ink (single source with side rail)", () => {
    render(<LakeOverlay {...props} />);
    const house = screen.getByRole("button", { name: "Ethan 首頁" });
    expect(getComputedStyle(house).color).toBe("rgb(255, 255, 255)");
    expect(HEXMAP["forecast_ink"]).toBe("#ffffff");
  });
  it("opening via house lands on grid (home = weather overview)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    // 初始關閉：Gmail 面板無 is-open
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    // 開→grid：Gmail 仍關閉，側軌總覽亮燈
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("mail → close → house returns to grid (no stuck on mail)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    const house = () => screen.getByRole("button", { name: "Ethan 首頁" });
    // 先經側軌 Gmail 鍵進 mail（避開手機 FAB 同名）
    await user.click(house());
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="Gmail"]') as HTMLElement);
    expect(screen.getByLabelText("Gmail 本週重點").className).toContain("is-open");
    // 房子鍵關閉時不動 activeId：只關面板（Gmail 關閉，燈號仍 mail）
    await user.click(house());
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 再按房子：回家回 grid（Gmail 仍關，總覽亮燈，Forecast 在席）
    await user.click(house());
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("LakeOverlay rail panel mapping", () => {
  it("GmailPanel stays mounted, open class flips (resident, stagger-safe)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    // 常駐：初始即在 DOM，但關閉態（無 is-open、hidden）
    const panel = screen.getByLabelText("Gmail 本週重點");
    expect(panel).toBeTruthy();
    expect(panel.className).not.toContain("is-open");
    expect((panel as HTMLElement).style.visibility).toBe("hidden");
    // 開 forecast（預設 grid）：Gmail 仍常駐但保持關閉
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 切 mail：同幀翻 open（closed→open 過程完整，stagger 可跑；側軌內 Gmail 鍵，避開手機浮鈕同名）
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="Gmail"]') as HTMLElement);
    const openPanel = screen.getByLabelText("Gmail 本週重點");
    expect(openPanel.className).toContain("is-open");
    expect((openPanel as HTMLElement).style.visibility).toBe("visible");
    // 切他鍵：DOM 常在，僅關閉（不卸載）
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    await user.click(screen.getByRole("button", { name: "總覽" }));
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
  });
});

describe("LakeOverlay mobile Gmail FAB", () => {
  // jsdom 會套用 base display:none（桌機態），故用 querySelector 取 DOM；
  // 窄屏可見/桌機隱藏契約由下方 CSS 文字斷言覆蓋（沿 ForecastSideRail 既有模式）。
  const getFab = () => document.querySelector(".lake-mail-fab") as HTMLElement;
  it("hidden on desktop, shown at narrow breakpoint (CSS assertion)", () => {
    render(<LakeOverlay {...props} />);
    const fab = getFab();
    expect(fab).toBeTruthy();
    expect(fab.getAttribute("aria-label")).toBe("Gmail");
    // display 交給 stylesheet（桌機 none、窄屏 grid），inline 不寫死 display
    expect(fab.style.display).toBe("");
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toContain(".lake-mail-fab");
    expect(css).toContain("max-width: 900px");
    expect(css).toContain(".lake-mail-fab{display:none");
  });
  it("40px circle glass blur12 INK, house same-slot geometry below house key", () => {
    render(<LakeOverlay {...props} />);
    const fab = getFab();
    const house = screen.getByRole("button", { name: "Ethan 首頁" }) as HTMLElement;
    expect(fab.style.width).toBe("40px");
    expect(fab.style.height).toBe("40px");
    expect(fab.style.borderRadius).toBe("50%");
    expect(fab.style.backdropFilter).toContain("blur(12px)");
    expect(getComputedStyle(fab).color).toBe(getComputedStyle(house).color);
    // 同槽幾何：同 left，房子鍵下方（top 大於房子 bottom=31+40=71）
    expect(fab.style.left).toBe(house.style.left);
    expect(parseFloat(fab.style.top)).toBeGreaterThan(71);
  });
  it("click opens Gmail panel directly (forecast open + mail active)", () => {
    render(<LakeOverlay {...props} />);
    const fab = getFab();
    // 初始關閉
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // jsdom 桌機態 display:none 擋 userEvent，改 fireEvent 直驗 handler
    //（setForecastOpen(true)＋setActiveId('mail')）；可見性由 CSS 斷言覆蓋
    fireEvent.click(fab);
    const openPanel = screen.getByLabelText("Gmail 本週重點");
    expect(openPanel.className).toContain("is-open");
    expect((openPanel as HTMLElement).style.visibility).toBe("visible");
  });
  it("toggles: closed shows Gmail and opens; mail-open shows 收起面板 and closes", () => {
    render(<LakeOverlay {...props} />);
    const getFabNow = () => document.querySelector(".lake-mail-fab") as HTMLElement;
    // 關態：Gmail 直開
    expect(getFabNow().getAttribute("aria-label")).toBe("Gmail");
    fireEvent.click(getFabNow());
    expect(screen.getByLabelText("Gmail 本週重點").className).toContain("is-open");
    // 開態（forecastOpen && mail）：轉收起鍵（防浮在文字上）
    expect(getFabNow().getAttribute("aria-label")).toBe("收起面板");
    fireEvent.click(getFabNow());
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 關後恢復 Gmail 直開
    expect(getFabNow().getAttribute("aria-label")).toBe("Gmail");
  });
  it("swaps icon with state: closed shows envelope, mail-open shows collapse arrow", () => {
    render(<LakeOverlay {...props} />);
    const getFabNow = () => document.querySelector(".lake-mail-fab") as HTMLElement;
    const hasPath = (fab: HTMLElement, d: string) =>
      Array.from(fab.querySelectorAll("path")).some((p) => p.getAttribute("d") === d);
    // 關態：信封（直開 Gmail）
    expect(getFabNow().querySelector("rect")).toBeTruthy();
    expect(hasPath(getFabNow(), "M3 7l9 6 9-6")).toBe(true);
    expect(hasPath(getFabNow(), "M21 12H9")).toBe(false);
    // 開態：側軌收起鍵同形箭頭（20px／stroke2 同規格），無信封（易混已除）
    fireEvent.click(getFabNow());
    expect(getFabNow().getAttribute("aria-label")).toBe("收起面板");
    expect(getFabNow().querySelector("rect")).toBeNull();
    expect(hasPath(getFabNow(), "M21 12H9")).toBe(true);
    expect(hasPath(getFabNow(), "m16 17 5-5-5-5")).toBe(true);
    expect((getFabNow().querySelector("svg") as Element).getAttribute("width")).toBe("20");
    // 關後恢復信封直開
    fireEvent.click(getFabNow());
    expect(getFabNow().querySelector("rect")).toBeTruthy();
    expect(hasPath(getFabNow(), "M21 12H9")).toBe(false);
  });
});

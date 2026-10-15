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
});

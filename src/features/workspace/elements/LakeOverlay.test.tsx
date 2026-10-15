// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
    // 切 mail：同幀翻 open（closed→open 過程完整，stagger 可跑）
    await user.click(screen.getByRole("button", { name: "Gmail" }));
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

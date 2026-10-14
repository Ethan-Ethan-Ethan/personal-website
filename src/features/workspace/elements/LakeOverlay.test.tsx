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
  it("mail mounts GmailPanel, other keys mount nothing, grid keeps ForecastGlass", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    expect(screen.queryByLabelText("Gmail 本週重點")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Gmail" }));
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.queryByLabelText("Gmail 本週重點")).toBeNull();
    await user.click(screen.getByRole("button", { name: "總覽" }));
    expect(screen.queryByLabelText("Gmail 本週重點")).toBeNull();
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LAKE_PHASES } from "../core/lake-palette";
import LakeOverlay from "./LakeOverlay";

// SplitText 拉起 gsap＋ScrollTrigger（import 期即呼叫 matchMedia，盖不住）：
// 房子測試與逐字動畫無關，直接 mock 掉。
vi.mock("../../../components/reactbits/SplitText", () => ({
  default: () => null,
}));

afterEach(() => cleanup());

// jsdom 無 matchMedia（SplitText／useReducedMotion 起播前檢查）：給確定終態。
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
  it("speaks side-rail glass language (forecast-house class + rule)", () => {
    render(<LakeOverlay {...props} />);
    const house = screen.getByRole("button", { name: "Ethan 首頁" });
    expect(house.classList.contains("forecast-house")).toBe(true);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toContain(".forecast-house");
    expect(css).toContain("border-radius:50%");
  });
});

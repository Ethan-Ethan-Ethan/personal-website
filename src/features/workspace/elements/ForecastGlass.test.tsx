// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { FORECAST_PLACEHOLDER } from "../core/forecast-placeholder";

// jsdom 無 matchMedia，gsap ScrollTrigger 在 import 時即呼叫：先 stub 再動態 import（不動全域 vitest 設定）。
let ForecastGlass: ComponentType<{ data: typeof FORECAST_PLACEHOLDER }>;
beforeAll(async () => {
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
  // jsdom 無 document.fonts（SplitText 起播前檢查）：給 loaded 終態。
  Object.defineProperty(document, "fonts", {
    value: { status: "loaded" },
    configurable: true,
  });
  ({ default: ForecastGlass } = await import("./ForecastGlass"));
});

describe("ForecastGlass hero", () => {
  it("renders chip, two hero lines and blurb", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} />);
    expect(screen.getByText("Weather Forecast")).toBeTruthy();
    // SplitText 逐字拆散 h1：改斷言 h1 全文（含兩行）。
    const h1 = document.querySelector("h1");
    expect(h1?.textContent).toContain("Strom");
    expect(h1?.textContent).toContain("with Heavy Rain");
    expect(screen.getByText(/Partly cloudy/)).toBeTruthy();
  });
});

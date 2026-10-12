// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { FORECAST_PLACEHOLDER } from "../core/forecast-placeholder";

afterEach(() => cleanup());

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
    value: {
      status: "loaded",
      addEventListener() {},
      removeEventListener() {},
    },
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
  it("renders 6 temps, 7 days with active highlight and wave svg end-state", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} />);
    const strip = document.querySelector('[aria-label="Hourly forecast"]');
    for (const t of ["11°", "13°", "14°", "10°", "19°", "12°"]) {
      expect(strip?.textContent).toContain(t);
    }
    for (const d of ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
      expect(strip?.textContent).toContain(d);
    }
    expect(document.querySelectorAll("path.draw")).toHaveLength(3);
    expect(document.querySelector("clipPath#wclip")).toBeTruthy();
  });
  it("renders rail main card and 3 city cards", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} />);
    const rail = document.querySelector('[aria-label="Saved locations"]');
    expect(rail?.textContent).toContain("Central Jakarta");
    expect(rail?.textContent).toContain("10°");
    for (const c of ["North Jakarta", "Bandung", "South Jakarta"]) {
      expect(rail?.textContent).toContain(c);
    }
  });
});

describe("ForecastGlass reduced motion", () => {
  beforeAll(async () => {
    vi.resetModules();
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn(() => ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
      })),
      configurable: true,
    });
    ({ default: ForecastGlass } = await import("./ForecastGlass"));
  });
  it("renders static hero text without SplitText chars", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} />);
    // 靜態分支：裸 span 直書全文，無逐字拆散。
    expect(screen.getByText("Strom")).toBeTruthy();
    expect(screen.getByText("with Heavy Rain")).toBeTruthy();
    expect(document.querySelectorAll(".split-char")).toHaveLength(0);
  });
});

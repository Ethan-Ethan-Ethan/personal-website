// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FORECAST_PLACEHOLDER } from "../core/forecast-placeholder";
import ForecastGlass from "./ForecastGlass";

afterEach(() => cleanup());

// jsdom 無 matchMedia／document.fonts（SplitText 起播前檢查）：給確定終態。
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
  Object.defineProperty(document, "fonts", {
    value: {
      status: "loaded",
      addEventListener() {},
      removeEventListener() {},
    },
    configurable: true,
  });
});

describe("ForecastGlass", () => {
  it("renders static hero copy when closed", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open={false} />);
    expect(screen.getByText("Weather Forecast")).toBeTruthy();
    expect(screen.getByText("Strom")).toBeTruthy();
    expect(screen.getByText("with Heavy Rain")).toBeTruthy();
    expect(screen.getByText(/Partly cloudy/)).toBeTruthy();
    expect(document.querySelector(".fc-node.is-open")).toBeFalsy();
  });
  it("opens cards with stagger classes, temps, days and wave structure", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const strip = document.querySelector('[aria-label="Hourly forecast"]');
    for (const t of ["11°", "13°", "14°", "10°", "19°", "12°"]) {
      expect(strip?.textContent).toContain(t);
    }
    for (const d of ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
      expect(strip?.textContent).toContain(d);
    }
    expect(document.querySelectorAll(".fc-node.is-open").length).toBeGreaterThanOrEqual(18);
    expect(document.querySelectorAll(".mask-line > span.is-open")).toHaveLength(2);
    expect(document.querySelectorAll("path.draw")).toHaveLength(3);
    expect(document.querySelector("clipPath#wclip")).toBeTruthy();
  });
  it("gates wave svg with fc-node when closed", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open={false} />);
    const svg = document.querySelector('[aria-label="Hourly forecast"] svg');
    expect(svg?.classList.contains("fc-node")).toBe(true);
    expect(svg?.classList.contains("is-open")).toBe(false);
  });
  it("leaves day font-size to stylesheet so mobile can shrink it", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const sat = screen.getByText("Saturday");
    expect(sat.classList.contains("fc-day")).toBe(true);
    expect((sat as HTMLElement).style.fontSize).toBe("");
  });
  it("shows wave svg when open", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const svg = document.querySelector('[aria-label="Hourly forecast"] svg');
    expect(svg?.classList.contains("fc-node")).toBe(true);
    expect(svg?.classList.contains("is-open")).toBe(true);
  });
  it("uses open tracking for CJK hero, tight tracking for Latin", () => {
    const { unmount } = render(
      <ForecastGlass
        data={{ ...FORECAST_PLACEHOLDER, heroLines: ["多雲時晴", "臺北市"], blurb: "多雲時晴，舒適。" }}
        open
      />
    );
    const h1 = document.querySelector('[aria-label="Forecast"] h1') as HTMLElement;
    expect(h1.style.letterSpacing).toBe("0.05em");
    unmount();
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const h1en = document.querySelector('[aria-label="Forecast"] h1') as HTMLElement;
    expect(h1en.style.letterSpacing).toBe("-0.02em");
  });
  it("declares short-height and narrow-desktop compaction queries", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toContain("max-height:500px");
    expect(css).toContain("max-width:1100px");
  });
  it("marks wave and days row for mobile compaction", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    expect(document.querySelector('[aria-label="Hourly forecast"] svg.fc-wave')).toBeTruthy();
    expect(document.querySelector('[aria-label="Hourly forecast"] .fc-days-row')).toBeTruthy();
  });
  it("shows attribution only when data carries it", () => {
    const { unmount } = render(
      <ForecastGlass data={{ ...FORECAST_PLACEHOLDER, attribution: "資料來源：X" }} open />
    );
    expect(screen.getByText("資料來源：X")).toBeTruthy();
    unmount();
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    expect(screen.queryByText(/資料來源/)).toBeFalsy();
  });
  it("renders rail main card and 3 city cards", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const rail = document.querySelector('[aria-label="Saved locations"]');
    expect(rail?.textContent).toContain("Central Jakarta");
    expect(rail?.textContent).toContain("10°");
    expect(rail?.textContent).toContain("現在");
    for (const c of ["North Jakarta", "Bandung", "South Jakarta"]) {
      expect(rail?.textContent).toContain(c);
    }
  });
});

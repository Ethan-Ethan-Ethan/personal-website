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
    expect(document.querySelectorAll(".fc-node.is-open")).toHaveLength(6);
    expect(document.querySelectorAll("path.draw")).toHaveLength(3);
    expect(document.querySelector("clipPath#wclip")).toBeTruthy();
  });
  it("renders rail main card and 3 city cards", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const rail = document.querySelector('[aria-label="Saved locations"]');
    expect(rail?.textContent).toContain("Central Jakarta");
    expect(rail?.textContent).toContain("10°");
    for (const c of ["North Jakarta", "Bandung", "South Jakarta"]) {
      expect(rail?.textContent).toContain(c);
    }
  });
});

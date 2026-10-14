import { describe, expect, it } from "vitest";
import { FORECAST_PLACEHOLDER } from "./forecast-placeholder";

describe("FORECAST_PLACEHOLDER", () => {
  it("has hero copy fields", () => {
    expect(FORECAST_PLACEHOLDER.chip).toBe("Weather Forecast");
    expect(FORECAST_PLACEHOLDER.heroLines).toEqual(["Strom", "with Heavy Rain"]);
    expect(FORECAST_PLACEHOLDER.blurb.length).toBeGreaterThan(0);
  });
  it("has 6 temps and 7 days with valid activeDay", () => {
    expect(FORECAST_PLACEHOLDER.temps).toHaveLength(6);
    expect(FORECAST_PLACEHOLDER.days).toHaveLength(7);
    expect(FORECAST_PLACEHOLDER.activeDay).toBeGreaterThanOrEqual(0);
    expect(FORECAST_PLACEHOLDER.activeDay).toBeLessThan(7);
  });
  it("has rail main metrics and 3 cities", () => {
    expect(FORECAST_PLACEHOLDER.railMain.city).toBe("Central Jakarta");
    expect(FORECAST_PLACEHOLDER.railMain.temp).toBe(10);
    expect(FORECAST_PLACEHOLDER.cities).toHaveLength(3);
  });
});

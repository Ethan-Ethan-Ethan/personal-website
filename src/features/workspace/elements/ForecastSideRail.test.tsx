// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForecastSideRail from "./ForecastSideRail";

afterEach(() => cleanup());

describe("ForecastSideRail", () => {
  it("renders 5 icon buttons with grid active by default", () => {
    render(<ForecastSideRail />);
    for (const label of ["總覽", "圖表", "地區", "日曆", "搜尋"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("switches active on click", async () => {
    const user = userEvent.setup();
    render(<ForecastSideRail />);
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.getByRole("button", { name: "圖表" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("false");
  });
});

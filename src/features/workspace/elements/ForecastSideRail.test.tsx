// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForecastSideRail from "./ForecastSideRail";

afterEach(() => cleanup());

describe("ForecastSideRail", () => {
  it("renders house plus 5 icon buttons with grid active by default", () => {
    render(<ForecastSideRail homeExpanded={false} onHomeToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "Ethan 首頁" })).toBeTruthy();
    for (const label of ["總覽", "圖表", "地區", "日曆", "搜尋"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("calls home toggle and switches active on click", async () => {
    const user = userEvent.setup();
    const onHomeToggle = vi.fn();
    render(<ForecastSideRail homeExpanded={false} onHomeToggle={onHomeToggle} />);
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    expect(onHomeToggle).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.getByRole("button", { name: "圖表" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("false");
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForecastSideRail from "./ForecastSideRail";

afterEach(() => cleanup());

describe("ForecastSideRail", () => {
  it("renders 5 icon buttons with grid active by default", () => {
    render(<ForecastSideRail onClose={() => {}} live={false} />);
    for (const label of ["總覽", "圖表", "地區", "日曆", "搜尋"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("switches active on click and closes via bottom button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ForecastSideRail onClose={onClose} live />);
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.getByRole("button", { name: "圖表" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("false");
    await user.click(screen.getByRole("button", { name: "收起面板" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("navigation", { name: "功能選單" }).style.backdropFilter).toBe("blur(12px)");
  });
});

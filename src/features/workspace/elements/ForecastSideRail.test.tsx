// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForecastSideRail from "./ForecastSideRail";

afterEach(() => cleanup());

describe("ForecastSideRail", () => {
  it("renders 5 icon buttons with grid active by default", () => {
    // 按鍵只在開啟態可及（關閉態 visibility:hidden 整棵藏起）：在此渲染開啟態驗證
    render(<ForecastSideRail onClose={() => {}} open />);
    for (const label of ["總覽", "圖表", "地區", "日曆", "搜尋"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("hides whole rail when closed", () => {
    render(<ForecastSideRail onClose={() => {}} open={false} />);
    expect(document.querySelector(".fc-node.is-open")).toBeFalsy();
    expect(getComputedStyle(document.querySelector(".forecast-side-rail") as Element).visibility).toBe("hidden");
  });
  it("hides icon rail at stacked breakpoint so hero text stays clear", () => {
    render(<ForecastSideRail onClose={() => {}} open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toContain("max-width: 900px");
  });
  it("leaves display to stylesheet so mobile media query can hide it", () => {
    render(<ForecastSideRail onClose={() => {}} open={false} />);
    const nav = document.querySelector(".forecast-side-rail") as HTMLElement;
    expect(nav.style.display).toBe("");
  });
  it("switches active on click and closes via bottom button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ForecastSideRail onClose={onClose} open />);
    await user.click(screen.getByRole("button", { name: "圖表" }));
    expect(screen.getByRole("button", { name: "圖表" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("false");
    expect(document.querySelector(".fc-node.is-open")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "收起面板" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

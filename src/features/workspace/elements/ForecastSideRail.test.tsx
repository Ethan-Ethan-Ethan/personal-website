// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForecastSideRail from "./ForecastSideRail";

afterEach(() => cleanup());

describe("ForecastSideRail", () => {
  it("renders icon buttons in order with grid active by default", () => {
    // 按鍵只在開啟態可及（關閉態 visibility:hidden 整棵藏起）：在此渲染開啟態驗證
    render(<ForecastSideRail onClose={() => {}} open />);
    const labels = ["總覽", "Gmail", "文章", "圖表", "交易", "日曆", "搜尋"];
    for (const label of labels) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    const buttons = screen.getAllByRole("button").filter((b) => labels.includes(b.getAttribute("aria-label") ?? ""));
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(labels);
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Gmail" }).getAttribute("aria-pressed")).toBe("false");
  });
  it("is controlled: click reports id via onSelect without internal state", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ForecastSideRail onClose={() => {}} open activeId="grid" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Gmail" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("mail");
    // 受控：父層未改 activeId 前燈號不動
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("reflects parent activeId", () => {
    render(<ForecastSideRail onClose={() => {}} open activeId="mail" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Gmail" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "總覽" }).getAttribute("aria-pressed")).toBe("false");
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
  it("closes via bottom button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ForecastSideRail onClose={onClose} open />);
    expect(document.querySelector(".fc-node.is-open")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "收起面板" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { HEXMAP } from "../core/recipe-runtime-binding";
import ForecastBottomBar from "./ForecastBottomBar";

afterEach(() => cleanup());

const css = () =>
  Array.from(document.querySelectorAll("style"))
    .map((s) => s.textContent ?? "")
    .join("\n");
const LABELS = ["Gmail", "圖表", "地區", "日曆", "搜尋"];

describe("ForecastBottomBar", () => {
  it("renders 5 tab keys in rail order without grid; grid active means no highlight", () => {
    render(<ForecastBottomBar />);
    const buttons = Array.from(
      document.querySelectorAll(".forecast-bottom-bar button")
    ) as HTMLElement[];
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(LABELS);
    // 總覽缺席：底欄無總覽鍵（回家走房子鍵）
    expect(
      document.querySelector('.forecast-bottom-bar button[aria-label="總覽"]')
    ).toBeNull();
    // 預設 activeId=grid：底欄無高亮即正常（五鍵全 false）
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "false",
      "false",
      "false",
      "false",
      "false",
    ]);
  });
  it("is controlled: click reports id via onSelect without internal state", () => {
    const onSelect = vi.fn();
    render(<ForecastBottomBar activeId="grid" onSelect={onSelect} />);
    // activeId=grid 時底欄無高亮：Gmail false＋總覽缺席
    expect(
      (
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("false");
    expect(
      document.querySelector('.forecast-bottom-bar button[aria-label="總覽"]')
    ).toBeNull();
    const gmail = document.querySelector(
      '.forecast-bottom-bar button[aria-label="Gmail"]'
    ) as HTMLElement;
    fireEvent.click(gmail);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("mail");
    // 受控：父層未改 activeId 前燈號不動（仍全滅）
    expect(
      (
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("false");
  });
  it("reflects parent activeId", () => {
    render(<ForecastBottomBar activeId="mail" onSelect={() => {}} />);
    expect(
      (
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("true");
    // 總覽缺席：activeId=mail 時底欄也不渲染總覽鍵
    expect(
      document.querySelector('.forecast-bottom-bar button[aria-label="總覽"]')
    ).toBeNull();
  });
  it("hidden on desktop, shown at stacked breakpoint (mutually exclusive with side rail)", () => {
    render(<ForecastBottomBar />);
    const nav = document.querySelector(".forecast-bottom-bar") as HTMLElement;
    expect(nav).toBeTruthy();
    // display 交給 stylesheet（桌機 none、窄屏 flex），inline 不寫死 display
    expect(nav.style.display).toBe("");
    const c = css();
    expect(c).toContain(".forecast-bottom-bar{display:none");
    expect(c).toContain("max-width: 900px");
    expect(c).toContain("@media (max-width: 900px){.forecast-bottom-bar{display:flex;");
  });
  it("glass blur12 + INK ink + safe-area inset-bottom", () => {
    render(<ForecastBottomBar />);
    const nav = document.querySelector(".forecast-bottom-bar") as HTMLElement;
    expect(nav.style.backdropFilter).toContain("blur(12px)");
    expect(nav.style.paddingBottom).toContain("env(safe-area-inset-bottom");
    expect(HEXMAP["forecast_ink"]).toBe("#ffffff");
    expect(
      getComputedStyle(
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as Element
      ).color
    ).toBe("rgb(255, 255, 255)");
  });
  it("active highlight matches side rail language (bg 0.22 + full opacity)", () => {
    render(<ForecastBottomBar activeId="mail" onSelect={() => {}} />);
    const gmail = document.querySelector(
      '.forecast-bottom-bar button[aria-label="Gmail"]'
    ) as HTMLElement;
    const chart = document.querySelector(
      '.forecast-bottom-bar button[aria-label="圖表"]'
    ) as HTMLElement;
    expect(gmail.style.background).toBe("rgba(255, 255, 255, 0.22)");
    expect(gmail.style.opacity).toBe("1");
    expect(chart.style.background).toBe("transparent");
    expect(chart.style.opacity).toBe("0.75");
    // 總覽缺席：高亮對照改用圖表鍵（總覽由房子鍵回家）
    expect(
      document.querySelector('.forecast-bottom-bar button[aria-label="總覽"]')
    ).toBeNull();
  });
});

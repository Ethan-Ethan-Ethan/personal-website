// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi, beforeAll } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FORECAST_PLACEHOLDER } from "../core/forecast-placeholder";
import ForecastGlass from "./ForecastGlass";
import GmailPanel from "./GmailPanel";

afterEach(() => cleanup());

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
});

// 回歸：fc-dir-r（translateX 30px）／fc-dir-l（translateX -26px）進場位移會把卡片右緣／左緣
// 撐出 overflow-y:auto 容器寬，觸發原生橫向 scrollbar（rail 底部白色橫條閃現）。
// 修法：容器加 overflow-x:hidden，直向 auto 保留。
describe("rail horizontal-scrollbar regression", () => {
  it("forecast-rail (desktop + 900px) keeps overflow-y auto with overflow-x hidden", () => {
    render(<ForecastGlass data={FORECAST_PLACEHOLDER} open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    // desktop 條：直向 auto 保留＋橫向 hidden
    expect(css).toContain(
      ".forecast-rail{pointer-events:none;max-height:80vh;overflow-y:auto;overflow-x:hidden;}"
    );
    // 900px 斷點條：直向 auto 保留＋橫向 hidden
    expect(css).toContain("max-height:46vh;overflow-y:auto;overflow-x:hidden;");
    // 手機堆疊捲動殼：同型 auto 容器（裝 fc-dir 子節點），橫向 hidden 同修
    expect(css).toContain("top:0;left:0;right:0;bottom:110px;overflow-y:auto;overflow-x:hidden;");
  });
  it("gmail-panel keeps overflowY auto with overflow-x hidden", () => {
    render(<GmailPanel open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toContain(".gmail-panel{scrollbar-width:thin;overflow-x:hidden;}");
    // inline overflowY auto 不動（直向捲動保留）
    const panel = document.querySelector(".gmail-panel") as HTMLElement;
    expect(panel.style.overflowY).toBe("auto");
  });
  it("gmail-rail keeps overflowY auto with overflow-x hidden", () => {
    render(<GmailPanel open />);
    const rail = document.querySelector(".gmail-rail") as HTMLElement;
    // 直向 auto 保留（80vh 側欄捲動）＋橫向 hidden（fc-dir-r 進場不撐出橫向 scrollbar）
    expect(rail.style.overflowY).toBe("auto");
    expect(rail.style.overflowX).toBe("hidden");
  });
  it("gmail-panel mobile (<=900px) uses full-height scroll region like forecast-stack", () => {
    render(<GmailPanel open />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    // Ego 390px 實測：header chip 101–127；FAB 已退役（底欄取代）。舊法 top:132px＋52vh 小盒會裁內容，
    // 改整頁捲動區 top:0→bottom:110px（止於底欄上），padding-top:96px 避讓 header 區，桌機不動。
    expect(css).toContain(
      "@media (max-width: 900px){.gmail-panel{top:0 !important;"
    );
    expect(css).toContain("bottom:110px !important;");
    expect(css).toContain("padding:96px 5% 130px;");
  });
});

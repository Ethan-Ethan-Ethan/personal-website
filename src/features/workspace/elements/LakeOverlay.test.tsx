// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HEXMAP } from "../core/recipe-runtime-binding";
import { LAKE_PHASES } from "../core/lake-palette";
import LakeOverlay from "./LakeOverlay";

afterEach(() => cleanup());

// SplitText 拉起 gsap＋ScrollTrigger（import 期即呼叫 matchMedia，盖不住）：
// 房子測試與逐字動畫無關，直接 mock 掉。
vi.mock("../../../components/reactbits/SplitText", () => ({
  default: () => null,
}));

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

const props = {
  phase: LAKE_PHASES[0],
  phaseIndex: 0,
  phaseCount: LAKE_PHASES.length,
  goTo: () => {},
  trackPlaying: false,
  onTogglePlay: () => {},
};

describe("LakeOverlay house button", () => {
  it("uses palette forecast_ink (single source with side rail)", () => {
    render(<LakeOverlay {...props} />);
    const house = screen.getByRole("button", { name: "Ethan 首頁" });
    expect(getComputedStyle(house).color).toBe("rgb(255, 255, 255)");
    expect(HEXMAP["forecast_ink"]).toBe("#ffffff");
  });
  it("opening via house lands on grid (home = weather overview)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    // 初始關閉：Gmail 面板無 is-open
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    // 開→grid：Gmail 仍關閉，側軌總覽亮燈（底欄同狀態機，燈號一致）
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    expect(document.querySelector('.forecast-side-rail button[aria-label="總覽"]')?.getAttribute("aria-pressed")).toBe("true");
  });
  it("mail → close → house returns to grid (no stuck on mail)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    const house = () => screen.getByRole("button", { name: "Ethan 首頁" });
    // 先經側軌 Gmail 鍵進 mail
    await user.click(house());
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="Gmail"]') as HTMLElement);
    expect(screen.getByLabelText("Gmail 本週重點").className).toContain("is-open");
    // 房子鍵關閉時不動 activeId：只關面板（Gmail 關閉，燈號仍 mail）
    await user.click(house());
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 再按房子：回家回 grid（Gmail 仍關，總覽亮燈，Forecast 在席）
    await user.click(house());
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    expect(document.querySelector('.forecast-side-rail button[aria-label="總覽"]')?.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("LakeOverlay rail panel mapping", () => {
  it("GmailPanel stays mounted, open class flips (resident, stagger-safe)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    // 常駐：初始即在 DOM，但關閉態（無 is-open、hidden）
    const panel = screen.getByLabelText("Gmail 本週重點");
    expect(panel).toBeTruthy();
    expect(panel.className).not.toContain("is-open");
    expect((panel as HTMLElement).style.visibility).toBe("hidden");
    // 開 forecast（預設 grid）：Gmail 仍常駐但保持關閉
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 切 mail：同幀翻 open（closed→open 過程完整，stagger 可跑；側軌 Gmail 鍵）
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="Gmail"]') as HTMLElement);
    const openPanel = screen.getByLabelText("Gmail 本週重點");
    expect(openPanel.className).toContain("is-open");
    expect((openPanel as HTMLElement).style.visibility).toBe("visible");
    // 切他鍵：DOM 常在，僅關閉（不卸載；側軌作用域查詢，底欄同名鍵不干擾）
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="圖表"]') as HTMLElement);
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    await user.click(document.querySelector('.forecast-side-rail button[aria-label="總覽"]') as HTMLElement);
    expect(screen.getByLabelText("Gmail 本週重點")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
  });
});

describe("LakeOverlay mobile bottom bar", () => {
  // 底欄在 jsdom 為桌機態 display:none（沿 FAB 舊例），可見性由 CSS 文字斷言覆蓋；
  // 點擊走 fireEvent 直驗 handler（與側軌同狀態機），可見性不擋 handler。
  const css = () =>
    Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
  it("renders five tab keys without grid; hidden on desktop, shown ≤900px", () => {
    render(<LakeOverlay {...props} />);
    const bar = document.querySelector(".forecast-bottom-bar") as HTMLElement;
    expect(bar).toBeTruthy();
    expect(
      Array.from(bar.querySelectorAll("button")).map((b) =>
        b.getAttribute("aria-label")
      )
    ).toEqual(["Gmail", "文章", "圖表", "地區", "日曆", "搜尋"]);
    // 總覽缺席：底欄無總覽鍵（回家走房子鍵；側軌六鍵不動）
    expect(
      bar.querySelector('button[aria-label="總覽"]')
    ).toBeNull();
    // display 交給 stylesheet（桌機 none、窄屏 flex），inline 不寫死 display
    expect(bar.style.display).toBe("");
    expect(css()).toContain(".forecast-bottom-bar{display:none");
    expect(css()).toContain("max-width: 900px");
    expect(css()).toContain(
      "@media (max-width: 900px){.forecast-bottom-bar{display:flex;"
    );
  });
  it("bottom-bar tap switches active with side rail (same state machine)", async () => {
    const user = userEvent.setup();
    render(<LakeOverlay {...props} />);
    // 房子鍵行為不動：開→grid
    await user.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    // 底欄 Gmail 鍵切 mail：面板開＋兩欄燈號一致
    fireEvent.click(
      document.querySelector(
        '.forecast-bottom-bar button[aria-label="Gmail"]'
      ) as HTMLElement
    );
    expect(screen.getByLabelText("Gmail 本週重點").className).toContain(
      "is-open"
    );
    expect(
      (
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      (
        document.querySelector(
          '.forecast-side-rail button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("true");
    // 底欄無總覽鍵：回 grid 走房子鍵（關→開兩段：先關面板，再回家回 grid）
    expect(
      document.querySelector('.forecast-bottom-bar button[aria-label="總覽"]')
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    // 第一段：房子鍵關閉時不動 activeId（只關面板，燈號仍 mail）
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain(
      "is-open"
    );
    fireEvent.click(screen.getByRole("button", { name: "Ethan 首頁" }));
    // 第二段：回家回 grid（Forecast 在席＋Gmail 關＋側軌總覽亮燈＋底欄無高亮）
    expect(screen.getByLabelText("Forecast")).toBeTruthy();
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain(
      "is-open"
    );
    expect(
      document.querySelector('.forecast-side-rail button[aria-label="總覽"]')?.getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      Array.from(
        document.querySelectorAll(".forecast-bottom-bar button[aria-pressed='true']")
      ).length
    ).toBe(0);
  });
  it("bottom-bar tap from closed selects + opens panel (Gmail: active mail + is-open)", async () => {
    render(<LakeOverlay {...props} />);
    // 初始關閉：Gmail 面板無 is-open、燈號 grid
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 底欄 Gmail 鍵直點（不經房子鍵）：面板開＋active 為 mail
    fireEvent.click(
      document.querySelector(
        '.forecast-bottom-bar button[aria-label="Gmail"]'
      ) as HTMLElement
    );
    expect(screen.getByLabelText("Gmail 本週重點").className).toContain(
      "is-open"
    );
    expect(
      (
        document.querySelector(
          '.forecast-bottom-bar button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("true");
  });
  it("side rail from closed only switches active, never opens panel (desktop unchanged)", async () => {
    render(<LakeOverlay {...props} />);
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain("is-open");
    // 桌機側軌 Gmail 鍵直點：只切 active（燈號 mail），面板不開
    fireEvent.click(
      document.querySelector(
        '.forecast-side-rail button[aria-label="Gmail"]'
      ) as HTMLElement
    );
    expect(
      (
        document.querySelector(
          '.forecast-side-rail button[aria-label="Gmail"]'
        ) as HTMLElement
      ).getAttribute("aria-pressed")
    ).toBe("true");
    expect(screen.getByLabelText("Gmail 本週重點").className).not.toContain(
      "is-open"
    );
  });
  it("bottom player + phase label yield to bar at ≤900px; desktop inline untouched", () => {
    render(<LakeOverlay {...props} />);
    const c = css();
    expect(c).toContain("max-width: 900px");
    expect(c).toContain(".lake-player-cluster{bottom:96px !important;}");
    expect(c).toContain(".lake-phase-label{bottom:96px !important;}");
    // 桌機零變化：inline bottom 仍 24px（讓位只走手機 media !important）
    expect(
      (document.querySelector(".lake-player-cluster") as HTMLElement).style
        .bottom
    ).toBe("24px");
    expect(
      (document.querySelector(".lake-phase-label") as HTMLElement).style.bottom
    ).toBe("24px");
  });
  it("FAB fully retired: zero references in DOM and CSS", () => {
    render(<LakeOverlay {...props} />);
    expect(document.querySelector(".lake-mail-fab")).toBeNull();
    expect(css()).not.toContain("lake-mail-fab");
    expect(css()).not.toContain("mail-fab");
  });
});

import { expect, test } from '@playwright/test';

// 視口迴歸矩陣（2026-10-15 手機遮字案）：面板開啟態下 hero／右欄／圖標欄互不遮擋、
// 無水平裁切、右欄內容皆可達（直接可見或在可滾容器內）。取值皆為機器量測斷言，非截圖比對。
const BANDS: Array<[number, number]> = [
  [320, 568],
  [360, 740],
  [390, 844],
  [768, 1024],
  [740, 360],
  [844, 390],
  [915, 412],
];

for (const [w, h] of BANDS) {
  test(`panel layout holds at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await page.getByRole('button', { name: 'Ethan 首頁' }).click();
    const bad = await page.evaluate(() => {
      const vw = window.innerWidth;
      const R = (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return null;
        return { l: r.left, t: r.top, r: r.right, b: r.bottom, el };
      };
      const out: string[] = [];
      const hero = R('[aria-label="Forecast"]');
      const rail = R('[aria-label="Saved locations"]');
      const nav = R('nav[aria-label="功能選單"]');
      const ov = (a: { l: number; t: number; r: number; b: number } | null, b: { l: number; t: number; r: number; b: number } | null) =>
        !!a && !!b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      if (ov(hero, rail)) out.push('hero-rail overlap');
      if (ov(hero, nav)) out.push('hero-nav overlap');
      for (const [name, b] of [['hero', hero], ['rail', rail]] as const) {
        if (b && (b.r > vw + 1 || b.l < -1)) out.push(`${name} h-clip`);
      }
      // strip 內文字（氣溫＋星期）不得溢出視口（容器合但內容溢是另一種遮）
      const inner = [...document.querySelectorAll('[aria-label="Hourly forecast"] span')]
        .map((el) => (el as HTMLElement).getBoundingClientRect());
      if (inner.some((r) => r.right > vw + 1)) out.push('strip inner h-clip');
      // 右欄可達性：直接可見，或在可滾容器內
      if (rail) {
        const st = document.querySelector('.forecast-stack') as HTMLElement | null;
        const stCs = st ? getComputedStyle(st) : null;
        const scrollable = !!st && st.scrollHeight > st.clientHeight + 2 &&
          (stCs?.overflowY === 'auto' || stCs?.overflowY === 'scroll');
        const cards = [...document.querySelectorAll('[aria-label="Saved locations"] > div')]
          .map((d) => (d as HTMLElement).getBoundingClientRect());
        const vh = window.innerHeight;
        const hidden = cards.filter((r) => r.bottom > vh + 1 || r.top < -1);
        if (hidden.length > 0 && !scrollable) out.push('rail content unreachable');
      }
      return out;
    });
    expect(bad).toEqual([]);
  });
}

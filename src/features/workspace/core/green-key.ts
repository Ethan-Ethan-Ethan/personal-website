// 綠幕去背唯一正本：四角平均取背景色＋42/72 雙門檻羽化＋去綠溢色。
// FishLayer（錦鯉）與 LotusLayer（荷葉）共用，禁另存第二份。
export function keyOutGreen(img: HTMLImageElement): HTMLCanvasElement | null {
  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return null;
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    // 背景綠取四角平均
    const corners = [0, c.width - 1, (c.height - 1) * c.width, c.height * c.width - 1];
    let br = 0;
    let bg = 0;
    let bb = 0;
    for (const ci of corners) {
      br += px[ci * 4];
      bg += px[ci * 4 + 1];
      bb += px[ci * 4 + 2];
    }
    br /= corners.length;
    bg /= corners.length;
    bb /= corners.length;
    for (let i = 0; i < px.length / 4; i++) {
      const r = px[i * 4];
      const gg = px[i * 4 + 1];
      const b = px[i * 4 + 2];
      const dist = Math.hypot(r - br, gg - bg, b - bb);
      if (dist < 42) {
        px[i * 4 + 3] = 0;
      } else if (dist < 72) {
        px[i * 4 + 3] = Math.floor(255 * ((dist - 42) / 30));
        // 去綠溢色
        const m = Math.min(r, b);
        if (gg > m) {
          const cut = Math.min(gg - m, 60);
          px[i * 4 + 1] = gg - cut * 0.6;
        }
      }
    }
    g.putImageData(data, 0, 0);
    return c;
  } catch {
    return null;
  }
}

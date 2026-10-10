// 魚群純邏輯（無 DOM，可測）：座標正規化 0..1，y 軸向下（2D canvas 系）。
export type Fish = { x: number; y: number; vx: number; vy: number; seed: number; boost: number };
export type Pointer = { x: number; y: number };
export type Scatter = { x: number; y: number; age: number };

export const FISH_COUNT = 8;
const ATTRACT_R = 0.28;
const MIN_DIST = 0.035;
const MAX_SPEED = 0.055;
const SCATTER_R = 0.3;

export function createSchool(count: number = FISH_COUNT, rand: () => number = Math.random): Fish[] {
  const out: Fish[] = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    out.push({
      x: 0.2 + rand() * 0.6,
      y: 0.2 + rand() * 0.6,
      vx: Math.cos(a) * MAX_SPEED * 0.5,
      vy: Math.sin(a) * MAX_SPEED * 0.5,
      seed: rand() * 100,
      boost: 0,
    });
  }
  return out;
}

export function stepSchool(
  fish: Fish[],
  dt: number,
  t: number,
  pointer: Pointer | null,
  scatter: Scatter | null,
): void {
  let cx = 0;
  let cy = 0;
  for (const f of fish) {
    cx += f.x;
    cy += f.y;
  }
  cx /= Math.max(fish.length, 1);
  cy /= Math.max(fish.length, 1);

  for (const f of fish) {
    let ax = Math.sin(t * 0.7 + f.seed) * 0.008;
    let ay = Math.cos(t * 0.5 + f.seed * 1.7) * 0.008;
    // 鬆散跟群＋互斥（不疊在一起）
    ax += (cx - f.x) * 0.06;
    ay += (cy - f.y) * 0.06;
    for (const o of fish) {
      if (o === f) continue;
      const sx = f.x - o.x;
      const sy = f.y - o.y;
      const sd = Math.hypot(sx, sy);
      if (sd < 0.045 && sd > 1e-4) {
        ax += (sx / sd) * 0.1 * (1 - sd / 0.045);
        ay += (sy / sd) * 0.1 * (1 - sd / 0.045);
      }
    }
    if (pointer) {
      const dx = pointer.x - f.x;
      const dy = pointer.y - f.y;
      const d = Math.hypot(dx, dy);
      if (d < ATTRACT_R && d > MIN_DIST) {
        ax += (dx / d) * 0.12;
        ay += (dy / d) * 0.12;
      }
    }
    if (scatter && scatter.age < 1.2) {
      const dx = f.x - scatter.x;
      const dy = f.y - scatter.y;
      const d = Math.hypot(dx, dy);
      if (d < SCATTER_R && d > 1e-4) {
        const k = (1 - scatter.age / 1.2) * 0.35;
        ax += (dx / d) * k;
        ay += (dy / d) * k;
        f.boost = 1;
      }
    }
    f.vx += ax * dt * 60 * 0.016;
    f.vy += ay * dt * 60 * 0.016;
    f.boost = Math.max(0, f.boost - dt * 0.8);
    const cap = MAX_SPEED * (1 + f.boost * 2);
    const sp = Math.hypot(f.vx, f.vy);
    if (sp > cap && sp > 1e-6) {
      f.vx = (f.vx / sp) * cap;
      f.vy = (f.vy / sp) * cap;
    }
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    // 軟邊界轉向
    if (f.x < 0.03) f.vx += 0.02 * dt * 60 * 0.016;
    if (f.x > 0.97) f.vx -= 0.02 * dt * 60 * 0.016;
    if (f.y < 0.03) f.vy += 0.02 * dt * 60 * 0.016;
    if (f.y > 0.97) f.vy -= 0.02 * dt * 60 * 0.016;
    f.x = Math.min(0.995, Math.max(0.005, f.x));
    f.y = Math.min(0.995, Math.max(0.005, f.y));
  }
}

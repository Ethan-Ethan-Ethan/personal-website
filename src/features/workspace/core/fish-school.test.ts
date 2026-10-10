import { describe, expect, it } from 'vitest';
import { createSchool, stepSchool } from './fish-school';

describe('fish school', () => {
  it('creates 8 fish in bounds', () => {
    const s = createSchool(8, () => 0.5);
    expect(s).toHaveLength(8);
    for (const f of s) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(1);
    }
  });

  it('approaches pointer', () => {
    const s = createSchool(3, () => 0.5);
    const px = 0.65;
    const py = 0.6;
    const before = Math.hypot(s[0].x - px, s[0].y - py);
    for (let i = 0; i < 240; i++) stepSchool(s, 1 / 60, i / 60, { x: px, y: py }, null);
    const after = Math.hypot(s[0].x - px, s[0].y - py);
    expect(after).toBeLessThan(before);
  });

  it('scatters from click', () => {
    const s = createSchool(3, () => 0.5);
    const cx = s[0].x;
    const cy = s[0].y;
    for (let i = 0; i < 40; i++) stepSchool(s, 1 / 60, i / 60, null, { x: cx, y: cy, age: i / 60 });
    const d = Math.hypot(s[0].x - cx, s[0].y - cy);
    expect(d).toBeGreaterThan(0.02);
  });

  it('stays in bounds and caps speed', () => {
    const s = createSchool(8, () => 0.99);
    for (let i = 0; i < 500; i++) {
      stepSchool(s, 1 / 60, i / 60, { x: 2, y: 2 }, { x: 0.5, y: 0.5, age: 0 });
      for (const f of s) {
        expect(f.x).toBeGreaterThanOrEqual(0);
        expect(f.x).toBeLessThanOrEqual(1);
        expect(Math.hypot(f.vx, f.vy)).toBeLessThanOrEqual(0.2);
      }
    }
  });

  it('separates overlapped fish', () => {
    const s = createSchool(4, () => 0.5);
    for (let i = 0; i < 200; i++) stepSchool(s, 1 / 60, i / 60, null, null);
    let min = Infinity;
    for (let a = 0; a < s.length; a++) {
      for (let b = a + 1; b < s.length; b++) {
        min = Math.min(min, Math.hypot(s[a].x - s[b].x, s[a].y - s[b].y));
      }
    }
    expect(min).toBeGreaterThan(0.01);
  });
});

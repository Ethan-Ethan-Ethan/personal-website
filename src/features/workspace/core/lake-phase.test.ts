import { describe, expect, it } from 'vitest';
import { LAKE_PHASES, PHASE_COUNT, normalizePhase } from './lake-palette';
import { AVAILABLE_TRACKS, resolveTrackSrc } from './lake-audio';
import { createPhaseController, PHASE_WINDOW_MS } from '../elements/useLakePhase';

describe('lake palette', () => {
  it('has 4 complete phases', () => {
    expect(PHASE_COUNT).toBe(4);
    expect(LAKE_PHASES.map((p) => p.id)).toEqual(['dawn', 'noon', 'dusk', 'night']);
    for (const p of LAKE_PHASES) {
      for (const k of ['id', 'name', 'sub', 'skyA', 'skyB', 'waterA', 'waterB', 'sun', 'sunPos', 'exposure', 'trackId'] as const) {
        expect(p[k], `${p.id}.${k}`).toBeDefined();
      }
    }
  });

  it('wraps indices', () => {
    expect(normalizePhase(-1)).toBe(3);
    expect(normalizePhase(4)).toBe(0);
  });
});

describe('phase controller throttle', () => {
  it('advances once per window', () => {
    const c = createPhaseController(4, PHASE_WINDOW_MS);
    expect(c.request(1, 0)).toBe(true);
    expect(c.request(1, 300)).toBe(false);
    expect(c.request(1, 600)).toBe(false);
    expect(c.get()).toBe(1);
    expect(c.request(1, 1001)).toBe(true);
    expect(c.get()).toBe(2);
  });

  it('lands goto', () => {
    const c = createPhaseController(4, PHASE_WINDOW_MS);
    expect(c.goTo(3, 3000)).toBe(true);
    expect(c.get()).toBe(3);
  });
});

describe('audio license gate', () => {
  it('stays locked until licensed', () => {
    expect(AVAILABLE_TRACKS).toEqual([]);
    expect(resolveTrackSrc('phase-dawn')).toBeNull();
  });

  it('rejects unknown tracks', () => {
    expect(resolveTrackSrc('nope')).toBeNull();
  });
});

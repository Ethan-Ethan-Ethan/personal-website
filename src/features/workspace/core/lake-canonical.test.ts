import { describe, expect, it } from 'vitest';
import { FISH_SPRITES } from './fish-sprites';
import { KOI_SHEET_PATH, RETIRED_ASSETS, RIVERBED_PATH } from './lake-assets';
import { DPR_CAP_2D, fishLightFilter, lotusLightFilter, spotVisibility } from './lake-light';
import { LAKE_PHASES } from './lake-palette';

describe('lake canonical', () => {
  it('light curves stay in sane ranges', () => {
    expect(fishLightFilter(0)).toBe('brightness(0.45) saturate(0.72)');
    expect(fishLightFilter(1)).toBe('brightness(1.10) saturate(1.25)');
    expect(fishLightFilter(1, 1)).toBe('brightness(1.10) saturate(1.25)');
    expect(fishLightFilter(1, 0)).toBe('brightness(0.61) saturate(1.25)');
    expect(spotVisibility(0)).toBeCloseTo(0.55, 2);
    expect(lotusLightFilter(0)).toBe('brightness(0.60) saturate(0.85)');
    expect(lotusLightFilter(1)).toBe('brightness(1.00) saturate(1.15)');
    expect(DPR_CAP_2D).toBe(1.5);
  });

  it('single sprite table, verified bases', () => {
    expect(FISH_SPRITES).toHaveLength(5);
    expect(FISH_SPRITES.map((s) => s.base)).toEqual([-Math.PI / 2, -Math.PI / 2, -Math.PI / 2, Math.PI / 2, -Math.PI / 2]);
  });

  it('single asset paths', () => {
    expect(KOI_SHEET_PATH).toBe('/assets/lake/koi-mix.png');
    expect(RIVERBED_PATH).toBe('/assets/lake/pond-08.png');
    expect(RETIRED_ASSETS).toEqual([]);
  });

  it('single palette', () => {
    expect(LAKE_PHASES.map((p) => p.id)).toEqual(['dawn', 'noon', 'dusk', 'night']);
  });
});

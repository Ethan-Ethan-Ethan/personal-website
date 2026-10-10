import { describe, expect, it } from 'vitest';
import { FISH_SPRITES } from './fish-sprites';
import { KOI_BLACK_PATH, KOI_SHEET_PATH, RETIRED_ASSETS, RIVERBED_PATH } from './lake-assets';
import { LAKE_PHASES } from './lake-palette';

describe('lake canonical', () => {
  it('single sprite table, verified bases', () => {
    expect(FISH_SPRITES).toHaveLength(3);
    expect(FISH_SPRITES.map((s) => s.base)).toEqual([Math.PI / 2, -Math.PI / 2, Math.PI / 2]);
  });

  it('single asset paths', () => {
    expect(KOI_SHEET_PATH).toBe('/assets/lake/koi-sheet.png');
    expect(KOI_BLACK_PATH).toBe('/assets/lake/koi-black.png');
    expect(RIVERBED_PATH).toBe('/assets/lake/riverbed-26.png');
    expect(RETIRED_ASSETS).toEqual(['koi-bold.png', 'riverbed-25.png']);
  });

  it('single palette', () => {
    expect(LAKE_PHASES.map((p) => p.id)).toEqual(['dawn', 'noon', 'dusk', 'night']);
  });
});

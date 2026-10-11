import { describe, expect, it } from 'vitest';
import { FISH_SPRITES } from './fish-sprites';
import { KOI_BLACK_PATH, KOI_SHEET_PATH, LOTUS_PATH, RETIRED_ASSETS, RIVERBED_PATH } from './lake-assets';
import { LAKE_PHASES } from './lake-palette';

describe('lake canonical', () => {
  it('single sprite table, verified bases', () => {
    expect(FISH_SPRITES).toHaveLength(5);
    expect(FISH_SPRITES.map((s) => s.base)).toEqual([-Math.PI / 2, -Math.PI / 2, -Math.PI / 2, Math.PI / 2, -Math.PI / 2]);
  });

  it('single asset paths', () => {
    expect(KOI_SHEET_PATH).toBe('/assets/lake/koi-mix.png');
    expect(KOI_BLACK_PATH).toBe('/assets/lake/koi-black.png');
    expect(LOTUS_PATH).toBe('/assets/lake/lotus-cluster.png');
    expect(RIVERBED_PATH).toBe('/assets/lake/pond-01.png');
    expect(RETIRED_ASSETS).toEqual(['koi-bold.png', 'riverbed-25.png', 'koi-sheet.png', 'koi-black.png', 'riverbed-26.png', 'lotus-small.png', 'pond-bed.png']);
  });

  it('single palette', () => {
    expect(LAKE_PHASES.map((p) => p.id)).toEqual(['dawn', 'noon', 'dusk', 'night']);
  });
});

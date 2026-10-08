export type LakePhase = {
  id: string;
  name: string;
  sub: string;
  skyA: string;
  skyB: string;
  waterA: string;
  waterB: string;
  sun: string;
  sunPos: [number, number];
  exposure: number;
  glint: number;
  trackId: string;
};

// A-minus 方向：滾輪不劫持；時段只由 dots／鍵盤／按鈕／swipe 切換。
// 音樂本體 Task 5 接；此處只定 trackId 契約。
export const LAKE_PHASES: LakePhase[] = [
  { id: 'dawn', name: '黎明', sub: 'First Light', skyA: '#2b3a5e', skyB: '#e8a06a', waterA: '#3a4a6b', waterB: '#141c33', sun: '#ffd9a0', sunPos: [0.5, 0.62], exposure: 1.0, glint: 1.0, trackId: 'phase-dawn' },
  { id: 'noon', name: '正午', sub: 'High Sun', skyA: '#3f7ec2', skyB: '#bcd9ef', waterA: '#2e6b8f', waterB: '#0f2f47', sun: '#fff4d6', sunPos: [0.5, 0.78], exposure: 1.05, glint: 0.8, trackId: 'phase-noon' },
  { id: 'dusk', name: '黃昏', sub: 'Last Glow', skyA: '#3a2b5c', skyB: '#ef7d54', waterA: '#4a3560', waterB: '#1a1430', sun: '#ffb36b', sunPos: [0.5, 0.56], exposure: 1.0, glint: 1.35, trackId: 'phase-dusk' },
  { id: 'night', name: '夜', sub: 'Still Water', skyA: '#060913', skyB: '#16233d', waterA: '#0d1626', waterB: '#04070f', sun: '#cfe0ff', sunPos: [0.68, 0.7], exposure: 0.95, glint: 0.55, trackId: 'phase-night' },
];

export const PHASE_COUNT = LAKE_PHASES.length;

export function normalizePhase(index: number): number {
  return ((index % PHASE_COUNT) + PHASE_COUNT) % PHASE_COUNT;
}

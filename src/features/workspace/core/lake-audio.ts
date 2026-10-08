// 合成水聲契約（WebAudio 程序白噪音，無檔案、無授權問題）。
// 每時段一組濾波參數：水聲隨時段變（夜低沉、正午開闊）。
export type WaterVoice = {
  filterFreq: number;
  q: number;
  gain: number;
  lfoRate: number;
  lfoDepth: number;
};

export const WATER_VOICES: Record<string, WaterVoice> = {
  'phase-dawn': { filterFreq: 900, q: 0.8, gain: 0.14, lfoRate: 0.12, lfoDepth: 220 },
  'phase-noon': { filterFreq: 1400, q: 0.6, gain: 0.11, lfoRate: 0.2, lfoDepth: 320 },
  'phase-dusk': { filterFreq: 700, q: 1.0, gain: 0.15, lfoRate: 0.09, lfoDepth: 180 },
  'phase-night': { filterFreq: 420, q: 1.2, gain: 0.16, lfoRate: 0.07, lfoDepth: 120 },
};

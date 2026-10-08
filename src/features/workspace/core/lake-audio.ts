// 音樂落地契約：靜態檔＋授權先行。AVAILABLE 為空＝正式曲目未授權，
// resolveTrackSrc 回 null，播放器呈 disabled（Task 5 驗收門）；授權確定後
// 把 trackId 登入 AVAILABLE 並放檔至 public/audio/，播放器自動解鎖。
export const AUDIO_BASE = '/audio';

export const TRACK_FILES: Record<string, string> = {
  'phase-dawn': 'phase-dawn.mp3',
  'phase-noon': 'phase-noon.mp3',
  'phase-dusk': 'phase-dusk.mp3',
  'phase-night': 'phase-night.mp3',
};

// 已授權並已放檔的曲目（目前空；見 public/audio/README.md）。
export const AVAILABLE_TRACKS: string[] = [];

export function resolveTrackSrc(trackId: string): string | null {
  const file = TRACK_FILES[trackId];
  if (!file) return null;
  if (!AVAILABLE_TRACKS.includes(trackId)) return null;
  return `${AUDIO_BASE}/${file}`;
}

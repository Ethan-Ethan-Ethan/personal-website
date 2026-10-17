import { useEffect, useRef, useState } from 'react';

// 本地音訊播放：播放 public/assets/audio/ 下的 MV 音軌（MP4 音訊）。
// AudioContext 建在第一次點擊裡（自動播放政策要求手勢解鎖）。
export function useLakeAudio(trackId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const AUDIO_URL = '/assets/audio/过来人TheOGs喆_20261018075113.mp3';

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_URL);
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        void audioRef.current.play().catch(() => {
          // 自動播放被攔截，等待用戶手勢再試
          setPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  useEffect(() => () => {
    try {
      audioRef.current?.pause();
      audioRef.current = null;
    } catch { /* unmount 盡力關 */ }
  }, []);

  const toggle = () => {
    setPlaying((prev) => !prev);
  };

  return { playing, toggle, ready: true };
}

import { useEffect, useRef, useState } from 'react';

// 本地音訊播放：播放 public/assets/audio/ 下的 MV 音軌（MP3 音訊）。
// AudioContext 建在第一次點擊裡（自動播放政策要求手勢解鎖）。
export function useLakeAudio(trackId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const AUDIO_URL = '/assets/audio/过来人TheOGs喆_20261018075113.mp3';

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_URL);
      audio.loop = true;
      audioRef.current = audio;
    }
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch((err) => {
          console.warn('audio play blocked by autoplay policy:', err);
          setPlaying(false);
        });
    }
  };

  useEffect(() => () => {
    try {
      audioRef.current?.pause();
      audioRef.current = null;
    } catch { /* unmount 盡力關 */ }
  }, []);

  return { playing, toggle, ready: true };
}

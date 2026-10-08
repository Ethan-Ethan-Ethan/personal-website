import { useEffect, useRef, useState } from 'react';
import LakeCanvas from './LakeCanvas';
import LakeOverlay from './LakeOverlay';
import { useLakePhase } from './useLakePhase';
import { PHASE_COUNT } from '../core/lake-palette';
import { resolveTrackSrc } from '../core/lake-audio';

export default function LakeLanding() {
  const { phaseIndex, phase, goTo } = useLakePhase();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const src = resolveTrackSrc(phase.trackId);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !playing || !src) return;
    if (el.getAttribute('src') !== src) {
      el.src = src;
      void el.play().catch(() => setPlaying(false));
    }
  }, [src, playing]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      if (el.getAttribute('src') !== src) el.src = src;
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <div className="lake-landing" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#060913' }}>
      <LakeCanvas phase={phaseIndex} />
      <LakeOverlay
        phase={phase}
        phaseIndex={phaseIndex}
        phaseCount={PHASE_COUNT}
        goTo={goTo}
        trackPlaying={playing}
        onTogglePlay={toggle}
      />
      <audio ref={audioRef} preload="none" aria-hidden="true" />
    </div>
  );
}

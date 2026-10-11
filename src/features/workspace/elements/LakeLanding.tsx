import LakeCanvas from './LakeCanvas';
import LakeOverlay from './LakeOverlay';
import FishLayer from './FishLayer';
import { useLakePhase } from './useLakePhase';
import { useLakeAudio } from './useLakeAudio';
import { PHASE_COUNT } from '../core/lake-palette';

export default function LakeLanding() {
  const { phaseIndex, phase, goTo } = useLakePhase();
  const { playing, toggle } = useLakeAudio(phase.trackId);
  // 魚亮度跟水光：水層蓋了 0.86 透明度，魚側調亮一點補（夜 0.76／晝 0.92）。
  const fishBrightness = 0.68 + 0.32 * Math.min(1, Math.max(0, (phase.exposure - 0.9) / 0.2));

  return (
    <div className="lake-landing" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#060913' }}>
      <FishLayer tint={phase.sun} brightness={fishBrightness} />
      <LakeCanvas phase={phaseIndex} />
      <LakeOverlay
        phase={phase}
        phaseIndex={phaseIndex}
        phaseCount={PHASE_COUNT}
        goTo={goTo}
        trackPlaying={playing}
        onTogglePlay={toggle}
      />
    </div>
  );
}

import LakeCanvas from './LakeCanvas';
import LakeOverlay from './LakeOverlay';
import FishLayer from './FishLayer';
import LotusLayer from './LotusLayer';
import { useLakePhase } from './useLakePhase';
import { useLakeAudio } from './useLakeAudio';
import { PHASE_COUNT } from '../core/lake-palette';

export default function LakeLanding() {
  const { phaseIndex, phase, goTo } = useLakePhase();
  const { playing, toggle } = useLakeAudio(phase.trackId);
  // 魚光跟水光：exposure 映射到 0..1，夜低晝高（FishLayer 內再轉亮度＋飽和）。
  const fishLight = Math.min(1, Math.max(0, (phase.exposure - 0.88) / 0.24));

  return (
    <div className="lake-landing" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#060913' }}>
      <LakeCanvas phase={phaseIndex} />
      <FishLayer tint={phase.sun} light={fishLight} sunX={phase.sunPos[0]} sunGlow={phase.glint} />
      <LotusLayer exposure={phase.exposure} waterB={phase.waterB} />
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

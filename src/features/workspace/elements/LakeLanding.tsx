import LakeCanvas from './LakeCanvas';
import LakeOverlay from './LakeOverlay';
import { useLakePhase } from './useLakePhase';
import { useLakeAudio } from './useLakeAudio';
import { PHASE_COUNT } from '../core/lake-palette';

export default function LakeLanding() {
  const { phaseIndex, phase, goTo } = useLakePhase();
  const { playing, toggle } = useLakeAudio(phase.trackId);

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
    </div>
  );
}

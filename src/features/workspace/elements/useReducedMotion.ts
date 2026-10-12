import { useEffect, useState } from 'react';

// Single shared hook (React layer only): lazy-init from matchMedia + follow OS changes with cleanup.
// (Replaces one-shot useState(false)+mount-effect copies; 2026-10-12 muse review.)
// Scope: React components (LakeOverlay). Canvas/2D layers (LakeCanvas/FishLayer/GalaxyCanvas/LotusLayer/useLakePointer)
// keep direct matchMedia by design (non-React boot path, no hook runtime); NOT a duplicate source.
export default function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

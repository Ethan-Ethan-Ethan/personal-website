import { useEffect, useState } from 'react';

// Single shared hook: lazy-init from matchMedia + follow OS changes with cleanup.
// (Replaces one-shot useState(false)+mount-effect copies; 2026-10-12 muse review.)
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { LAKE_PHASES, PHASE_COUNT, normalizePhase } from '../core/lake-palette';

// 過渡窗：連打只前進 1（NN/g 快 scroll rate 精神：1–2 次互動即見結果，但禁連跳）。
export const PHASE_WINDOW_MS = 1000;
// touch 位移門檻（站內無前例，新定；mobile 另做非劫持版時沿用）。
export const SWIPE_MIN_PX = 48;

export function createPhaseController(count: number = PHASE_COUNT, windowMs: number = PHASE_WINDOW_MS) {
  let index = 0;
  let lastAt = -Infinity;
  return {
    get() {
      return index;
    },
    request(dir: 1 | -1, now: number): boolean {
      if (now - lastAt < windowMs) return false;
      lastAt = now;
      index = (((index + dir) % count) + count) % count;
      return true;
    },
    goTo(i: number, now: number): boolean {
      if (now - lastAt < windowMs) return false;
      lastAt = now;
      index = (((i % count) % count) + count) % count;
      return true;
    },
  };
}

// A-minus：鍵盤＋swipe 全域監聽（只在湖面掛載時存在）；dots／按鈕由 Task 5 overlay 調同一個 go。
export function useLakePhase() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const ctrlRef = useRef<ReturnType<typeof createPhaseController> | null>(null);
  if (!ctrlRef.current) ctrlRef.current = createPhaseController();
  const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);

  const go = useCallback((dir: 1 | -1) => {
    const ctrl = ctrlRef.current;
    if (!ctrl) return;
    if (ctrl.request(dir, now())) setPhaseIndex(ctrl.get());
  }, []);
  const goTo = useCallback((i: number) => {
    const ctrl = ctrlRef.current;
    if (!ctrl) return;
    if (ctrl.goTo(i, now())) setPhaseIndex(ctrl.get());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'ArrowLeft') go(-1);
    };
    let startY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (startY === null) return;
      const endY = event.changedTouches.length > 0 ? event.changedTouches[0].clientY : startY;
      const dy = startY - endY;
      startY = null;
      if (Math.abs(dy) < SWIPE_MIN_PX) return;
      go(dy > 0 ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [go]);

  const safe = normalizePhase(phaseIndex);
  return { phaseIndex: safe, phase: LAKE_PHASES[safe], go, goTo };
}

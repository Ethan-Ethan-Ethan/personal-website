import { useMemo } from 'react';

export type Ripple = { x: number; y: number; t0: number; amp: number };

export const RIPPLE_MAX = 12;
// 與 LakeCanvas shader 內 exp(-age*1.5) 同式；CPU 側只做測試與上限判斷。
export function rippleWeight(r: Ripple, now: number): number {
  const age = now - r.t0;
  if (age < 0) return 0;
  return r.amp * Math.exp(-age * 1.5);
}

export function createRippleBuffer(max: number = RIPPLE_MAX) {
  const list: Ripple[] = [];
  return {
    list,
    push(x: number, y: number, t0: number, amp: number = 1) {
      if (list.length >= max) list.shift();
      list.push({ x, y, t0, amp });
    },
    clear() {
      list.length = 0;
    },
  };
}

// React 綁定：穩定 buffer＋省電開關。DOM 監聽由持有者（LakeCanvas）掛載，與 Galaxy 模式一致。
export function useLakePointer(max: number = RIPPLE_MAX) {
  const buf = useMemo(() => createRippleBuffer(max), [max]);
  const enabled = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  return { list: buf.list, push: buf.push, clear: buf.clear, enabled };
}

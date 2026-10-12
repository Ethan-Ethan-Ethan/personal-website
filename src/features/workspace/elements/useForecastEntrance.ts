import { useEffect, useState } from 'react';

// 過場唯一正本：LakeOverlay 呼叫，所有 forecast 進場動畫由此單一 orchestrator 驅動。
// 語言鎖定：常駐房子（永不卸載）＋錨定房子中心＋expo.out .45s＋stagger＋減動畫直出終態。
export default function useForecastEntrance(open: boolean): boolean {
  const [reduced] = useState<boolean>(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!open) {
      setLive(false);
      return;
    }
    if (reduced) {
      setLive(true);
      return;
    }
    let cancelled = false;
    const fallback = window.setTimeout(() => { if (!cancelled) setLive(true); }, 900);
    (async () => {
      let gsap: { timeline: (...args: unknown[]) => unknown } | null = null;
      try {
        ({ default: gsap } = await import('gsap'));
      } catch {
        return;
      }
      if (cancelled || !gsap) return;
      const house = document.querySelector('[aria-label="Ethan 首頁"]')?.getBoundingClientRect();
      if (!house) return;
      const hx = house.left + house.width / 2;
      const hy = house.top + house.height / 2;
      const order = ['rail', 'hero', 'strip', 'aside'];
      const targets: { el: Element; ox: number; oy: number }[] = [];
      for (const name of order) {
        const el = document.querySelector(`[data-entrance="${name}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        targets.push({ el, ox: hx - r.left, oy: hy - r.top });
      }
      if (!targets.length || cancelled) return;
      const tl = (gsap as unknown as {
        timeline: (vars?: Record<string, unknown>) => {
          fromTo: (t: Element, a: Record<string, unknown>, b: Record<string, unknown>, p?: number) => void;
          eventCallback: (n: string, f: () => void) => void;
        };
      }).timeline({ defaults: { ease: 'expo.out', overwrite: 'auto' } });
      targets.forEach(({ el, ox, oy }, i) => {
        tl.fromTo(
          el,
          { opacity: 0, scale: 0.92, y: -10, transformOrigin: `${ox}px ${oy}px` },
          { opacity: 1, scale: 1, y: 0, duration: 0.45 },
          i * 0.08
        );
      });
      tl.eventCallback('onComplete', () => {
        window.clearTimeout(fallback);
        if (!cancelled) setLive(true);
      });
    })();
    return () => { cancelled = true; window.clearTimeout(fallback); };
  }, [open, reduced]);

  return reduced || live;
}

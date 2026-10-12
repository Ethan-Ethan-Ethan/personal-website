import { useEffect, useState } from 'react';

// 過場唯一正本：LakeOverlay 呼叫，所有 forecast 進場動畫由此單一 orchestrator 驅動。
// 語言鎖定（2026-10-13）：blur 全程掛載＋純 opacity stagger（背板取樣矩靜止，單一連續；去 scale／y）。
// 減動畫：無 timeline，live 直出終態。
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
    // live 即時點火：字／波形／霧化與淡入同幀開始，同一個視覺事件。
    setLive(true);
    if (reduced) return;
    let cancelled = false;
    (async () => {
      let gsap: { timeline: (...args: unknown[]) => unknown } | null = null;
      try {
        ({ default: gsap } = await import('gsap'));
      } catch {
        return;
      }
      if (cancelled || !gsap) return;
      const order = ['rail', 'hero', 'strip', 'aside'];
      const els: Element[] = [];
      for (const name of order) {
        const el = document.querySelector(`[data-entrance="${name}"]`);
        if (el) els.push(el);
      }
      if (!els.length || cancelled) return;
      const tl = (gsap as unknown as {
        timeline: (vars?: Record<string, unknown>) => {
          fromTo: (t: Element, a: Record<string, unknown>, b: Record<string, unknown>, p?: number) => void;
        };
      }).timeline({ defaults: { ease: 'expo.out', overwrite: 'auto' } });
      els.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45 }, i * 0.08);
      });
    })();
    return () => { cancelled = true; };
  }, [open, reduced]);

  return live;
}

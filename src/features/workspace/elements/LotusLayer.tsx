import { useEffect, useRef } from 'react';
import { LOTUS_PATH } from '../core/lake-assets';
import { keyOutGreen } from '../core/green-key';

type Props = { light: number };

// 荷葉浮層：去背荷葉叢貼在水面之上（z 在魚之上、UI 之下），魚從葉底游過。
// 減動畫時靜止一幀，不跑 rAF。
export default function LotusLayer({ light }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef(light);
  lightRef.current = light;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cluster: HTMLCanvasElement | null = null;
    const img = new Image();
    img.src = LOTUS_PATH;
    img.onload = () => {
      cluster = keyOutGreen(img);
      if (reduced) draw(0);
    };

    let raf = 0;
    let disposed = false;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(host.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const draw = (t: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = host.clientWidth;
      const H = host.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!cluster) return;
      const l = Math.min(1, Math.max(0, lightRef.current));
      ctx.filter = `brightness(${(0.45 + 0.55 * l).toFixed(2)}) saturate(${(0.7 + 0.4 * l).toFixed(2)})`;
      const S = Math.min(W, H);
      const sway = reduced ? 0 : Math.sin(t * 0.3) * 0.02;
      const drift = reduced ? 0 : Math.sin(t * 0.23) * 6;
      // 左叢
      ctx.save();
      ctx.translate(-0.03 * W + drift, 0.3 * H);
      ctx.rotate(-0.15 + sway);
      const s1 = S * 0.62;
      ctx.drawImage(cluster, -s1 / 2, -s1 / 2, s1, s1);
      ctx.restore();
      // 右叢（鏡像，錯開位置與大小）
      ctx.save();
      ctx.translate(1.03 * W - drift, 0.66 * H);
      ctx.rotate(0.12 - sway);
      ctx.scale(-1, 1);
      const s2 = S * 0.7;
      ctx.drawImage(cluster, -s2 / 2, -s2 / 2, s2, s2);
      ctx.restore();
      ctx.filter = 'none';
    };

    if (!reduced) {
      const tick = () => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        if (document.hidden) return;
        draw((performance.now() - t0) / 1000);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="lotus-layer" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

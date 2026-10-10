import { useEffect, useRef } from 'react';
import { createSchool, stepSchool, type Fish } from '../core/fish-school';

type Props = { tint: string };

export default function FishLayer({ tint }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef(tint);
  tintRef.current = tint;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fish: Fish[] = createSchool(8);
    let pointer: { x: number; y: number; at: number } | null = null;
    let splash: { x: number; y: number; t0: number } | null = null;
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let disposed = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(host.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const toLocal = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / Math.max(rect.width, 1),
        y: (clientY - rect.top) / Math.max(rect.height, 1),
      };
    };
    const onMove = (event: PointerEvent) => {
      const p = toLocal(event.clientX, event.clientY);
      pointer = { ...p, at: performance.now() };
    };
    const onDown = (event: PointerEvent) => {
      const p = toLocal(event.clientX, event.clientY);
      splash = { ...p, t0: performance.now() };
      pointer = { ...p, at: performance.now() };
    };
    host.parentElement?.addEventListener('pointermove', onMove, { passive: true });
    host.parentElement?.addEventListener('pointerdown', onDown, { passive: true });

    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden) {
        last = performance.now();
        return;
      }
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - t0) / 1000;
      const livePointer =
        pointer && now - pointer.at < 2500 ? { x: pointer.x, y: pointer.y } : null;
      const liveSplash =
        splash && (now - splash.t0) / 1000 < 1.2
          ? { x: splash.x, y: splash.y, age: (now - splash.t0) / 1000 }
          : null;
      stepSchool(fish, dt, t, livePointer, liveSplash);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = host.clientWidth;
      const H = host.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const L = Math.min(W, H) * 0.045;
      for (const f of fish) {
        const x = f.x * W;
        const y = f.y * H;
        const heading = Math.atan2(f.vy, f.vx);
        const wag = Math.sin(t * 9 + f.seed) * 0.55;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = '#10151f';
        ctx.shadowColor = tintRef.current;
        ctx.shadowBlur = 7;
        // 身體
        ctx.beginPath();
        ctx.ellipse(0, 0, L * 0.5, L * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 尾巴（擺動）
        ctx.beginPath();
        ctx.moveTo(-L * 0.42, 0);
        ctx.lineTo(-L * 0.72, -L * 0.2 + wag * L * 0.08);
        ctx.lineTo(-L * 0.72, L * 0.2 + wag * L * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.parentElement?.removeEventListener('pointermove', onMove);
      host.parentElement?.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVis);
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="fish-layer" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

import { useEffect, useRef } from 'react';
import { LOTUS_PATH } from '../core/lake-assets';
import { keyOutGreen } from '../core/green-key';

type Props = { light: number };

// 荷葉浮層：第一版荷葉叢整幅貼（左右各一，右鏡像），魚從葉底游過。
// 每叢自帶接觸陰影（水面壓痕）＋邊緣預烤柔化；減動畫時靜止一幀。
const CLUSTERS = [
  { ax: -0.14, ay: 0.16, size: 0.62, mirror: false, phase: 0 },
  { ax: 1.14, ay: 0.82, size: 0.7, mirror: true, phase: 2.1 },
];

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
      const keyed = keyOutGreen(img);
      if (!keyed) return;
      // 邊緣預烤柔化，幀內不再糊。
      const soft = document.createElement('canvas');
      soft.width = keyed.width;
      soft.height = keyed.height;
      const sg = soft.getContext('2d');
      if (!sg) return;
      sg.filter = 'blur(0.6px)';
      sg.drawImage(keyed, 0, 0);
      cluster = soft;
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
      // 葉不透：亮度下限 0.6 保實色，只跟光走明暗，不動 alpha。
      ctx.filter = `brightness(${(0.6 + 0.4 * l).toFixed(2)}) saturate(${(0.85 + 0.3 * l).toFixed(2)})`;
      const S = Math.min(W, H);
      CLUSTERS.forEach((C) => {
        const size = S * C.size;
        // 浮感跟水波紋同級（轉 0.02、漂 5px）＋2px 沉浮。
        const sway = reduced ? 0 : Math.sin(t * 0.3 + C.phase) * 0.02;
        const drift = reduced ? 0 : Math.sin(t * 0.23 + C.phase) * 5;
        const bob = reduced ? 0 : Math.sin(t * 0.5 + C.phase * 1.7) * 2;
        const cx = C.ax * W + drift;
        const cy = C.ay * H + drift * 0.6 + bob;
        // 接觸陰影：葉下水面壓痕（徑向漸層，無濾鏡成本）
        const sh = ctx.createRadialGradient(cx, cy + size * 0.03, size * 0.1, cx, cy + size * 0.03, size * 0.55);
        sh.addColorStop(0, 'rgba(0,0,0,0.32)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh;
        ctx.fillRect(cx - size * 0.6, cy - size * 0.5, size * 1.2, size * 1.1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sway);
        if (C.mirror) ctx.scale(-1, 1);
        ctx.drawImage(cluster, -size / 2, -size / 2, size, size);
        ctx.restore();
      });
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

  return <div ref={hostRef} className="lotus-layer" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }} />;
}

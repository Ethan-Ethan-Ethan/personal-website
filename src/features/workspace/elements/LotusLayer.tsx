import { useEffect, useRef } from 'react';
import { LOTUS_PATH } from '../core/lake-assets';
import { keyOutGreen } from '../core/green-key';

type Props = { light: number };

// 荷葉浮層：三片小單葉散放水面之上（z 在魚之上、UI 之下），魚從葉底游過。
// 每片自帶接觸陰影（水面壓痕）＋邊緣預烤柔化；減動畫時靜止一幀。
const LEAVES = [
  { sx: 0.29, sy: 0.14, sw: 0.28, sh: 0.22, ax: 0.1, ay: 0.2, size: 0.2, phase: 0 },
  { sx: 0.14, sy: 0.59, sw: 0.29, sh: 0.28, ax: 0.88, ay: 0.3, size: 0.22, phase: 2.1 },
  { sx: 0.59, sy: 0.49, sw: 0.27, sh: 0.22, ax: 0.2, ay: 0.78, size: 0.24, phase: 4.2 },
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

    let leaves: HTMLCanvasElement[] = [];
    const img = new Image();
    img.src = LOTUS_PATH;
    img.onload = () => {
      const keyed = keyOutGreen(img);
      if (!keyed) return;
      const out: HTMLCanvasElement[] = [];
      for (const L of LEAVES) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.floor(keyed.width * L.sw));
        c.height = Math.max(1, Math.floor(keyed.height * L.sh));
        const g = c.getContext('2d');
        if (!g) continue;
        g.drawImage(keyed, L.sx * keyed.width, L.sy * keyed.height, c.width, c.height, 0, 0, c.width, c.height);
        // 邊緣預烤柔化（破圖感來源之一），幀內不再糊。
        const soft = document.createElement('canvas');
        soft.width = c.width;
        soft.height = c.height;
        const sg = soft.getContext('2d');
        if (!sg) continue;
        sg.filter = 'blur(0.6px)';
        sg.drawImage(c, 0, 0);
        out.push(soft);
      }
      if (out.length > 0) {
        leaves = out;
        if (reduced) draw(0);
      }
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
      if (leaves.length === 0) return;
      const l = Math.min(1, Math.max(0, lightRef.current));
      ctx.filter = `brightness(${(0.45 + 0.55 * l).toFixed(2)}) saturate(${(0.7 + 0.4 * l).toFixed(2)})`;
      const S = Math.min(W, H);
      leaves.forEach((leaf, i) => {
        const L = LEAVES[i % LEAVES.length];
        const size = S * L.size;
        const sway = reduced ? 0 : Math.sin(t * 0.3 + L.phase) * 0.02;
        const drift = reduced ? 0 : Math.sin(t * 0.23 + L.phase) * 5;
        const cx = L.ax * W + drift;
        const cy = L.ay * H + drift * 0.6;
        // 接觸陰影：葉下水面壓痕（徑向漸層，無濾鏡成本）
        const sh = ctx.createRadialGradient(cx, cy + size * 0.03, size * 0.1, cx, cy + size * 0.03, size * 0.55);
        sh.addColorStop(0, 'rgba(0,0,0,0.32)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh;
        ctx.fillRect(cx - size * 0.6, cy - size * 0.5, size * 1.2, size * 1.1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sway);
        ctx.drawImage(leaf, -size / 2, -size / 2, size, size);
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

  return <div ref={hostRef} className="lotus-layer" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

import { useEffect, useRef } from 'react';
import { createSchool, stepSchool, type Fish } from '../core/fish-school';

type Props = { tint: string };

// 貼圖錦鯉：koi-sheet.png 三條裁切（分數座標），base 為圖中朝向。
// 讀不到圖時退回向量錦鯉（下方案）。
const SPRITES = [
  { x: 0.0, y: 0.0, w: 0.355, h: 1.0, base: -Math.PI / 2 },
  { x: 0.355, y: 0.27, w: 0.31, h: 0.6, base: Math.PI / 2 },
  { x: 0.665, y: 0.0, w: 0.335, h: 0.93, base: Math.PI / 2 },
];

function keyOutGreen(img: HTMLImageElement): HTMLCanvasElement | null {
  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return null;
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    // 背景綠取四角平均
    const corners = [0, c.width - 1, (c.height - 1) * c.width, c.height * c.width - 1];
    let br = 0;
    let bg = 0;
    let bb = 0;
    for (const ci of corners) {
      br += px[ci * 4];
      bg += px[ci * 4 + 1];
      bb += px[ci * 4 + 2];
    }
    br /= corners.length;
    bg /= corners.length;
    bb /= corners.length;
    for (let i = 0; i < px.length / 4; i++) {
      const r = px[i * 4];
      const gg = px[i * 4 + 1];
      const b = px[i * 4 + 2];
      const dist = Math.hypot(r - br, gg - bg, b - bb);
      if (dist < 42) {
        px[i * 4 + 3] = 0;
      } else if (dist < 72) {
        px[i * 4 + 3] = Math.floor(255 * ((dist - 42) / 30));
        // 去綠溢色
        const m = Math.min(r, b);
        if (gg > m) {
          const cut = Math.min(gg - m, 60);
          px[i * 4 + 1] = gg - cut * 0.6;
        }
      }
    }
    g.putImageData(data, 0, 0);
    return c;
  } catch {
    return null;
  }
}

export default function FishLayer({ tint }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef(tint);
  tintRef.current = tint;
  const spritesRef = useRef<{ c: HTMLCanvasElement; base: number }[]>([]);

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
    const sheet = new Image();
    sheet.src = '/assets/lake/koi-bold.png';
    sheet.onload = () => {
      const keyed = keyOutGreen(sheet);
      if (!keyed) return;
      const out: { c: HTMLCanvasElement; base: number }[] = [];
      for (const s of SPRITES) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.floor(keyed.width * s.w));
        c.height = Math.max(1, Math.floor(keyed.height * s.h));
        const g = c.getContext('2d');
        if (!g) continue;
        g.drawImage(
          keyed,
          s.x * keyed.width, s.y * keyed.height, c.width, c.height,
          0, 0, c.width, c.height,
        );
        out.push({ c, base: s.base });
      }
      if (out.length > 0) spritesRef.current = out;
    };
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
      const L = Math.min(W, H) * 0.05;
      const frac = (n: number) => n - Math.floor(n);
      const sprites = spritesRef.current;
      for (const f of fish) {
        const x = f.x * W;
        const y = f.y * H;
        const heading = Math.atan2(f.vy, f.vx);
        const wag = Math.sin(t * 9 + f.seed) * 0.55;
        if (sprites.length > 0) {
          // 整條 rigid 貼（擺尾先拿掉：接縫會斷）。
          const sp = sprites[Math.abs(Math.floor(f.seed)) % sprites.length];
          const breathe = 1 + 0.02 * Math.sin(t * 3 + f.seed);
          const len = L * 1.35 * breathe;
          const wid = len * (sp.c.width / Math.max(sp.c.height, 1));
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(heading - sp.base);
          ctx.globalAlpha = 0.93;
          ctx.shadowColor = tintRef.current;
          ctx.shadowBlur = 5;
          ctx.drawImage(sp.c, -len / 2, -wid / 2, len, wid);
          ctx.restore();
          continue;
        }
        const s1 = frac(f.seed * 0.37);
        const s2 = frac(f.seed * 0.73);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.globalAlpha = 0.94;
        // 尾巴：飄帶分叉，隨擺動
        const tw = wag * L * 0.1;
        ctx.fillStyle = 'rgba(224,106,53,0.78)';
        ctx.beginPath();
        ctx.moveTo(-L * 0.38, 0);
        ctx.quadraticCurveTo(-L * 0.62, -L * 0.1 + tw, -L * 0.88, -L * 0.22 + tw);
        ctx.quadraticCurveTo(-L * 0.7, tw * 0.5, -L * 0.88, L * 0.22 + tw);
        ctx.quadraticCurveTo(-L * 0.62, L * 0.1 + tw, -L * 0.38, 0);
        ctx.fill();
        // 身體：頭淺尾深的錦鯉橘漸層
        const grad = ctx.createLinearGradient(L * 0.55, 0, -L * 0.45, 0);
        grad.addColorStop(0, '#f4c193');
        grad.addColorStop(0.55, '#ec8a4e');
        grad.addColorStop(1, '#d95f2b');
        ctx.fillStyle = grad;
        ctx.shadowColor = tintRef.current;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, L * 0.5, L * 0.165, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // 白斑（每條位置固定，由 seed 定）
        ctx.fillStyle = 'rgba(247,242,232,0.9)';
        ctx.beginPath();
        ctx.ellipse(-L * 0.05 + s1 * L * 0.2, -L * 0.04, L * 0.13, L * 0.07, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(L * 0.18 - s2 * L * 0.15, L * 0.05, L * 0.09, L * 0.055, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // 胸鰭（微拍）
        ctx.fillStyle = 'rgba(217,95,43,0.7)';
        const flap = Math.sin(t * 9 + f.seed + 1.2) * L * 0.02;
        ctx.beginPath();
        ctx.moveTo(L * 0.05, -L * 0.1);
        ctx.lineTo(-L * 0.12, -L * 0.24 + flap);
        ctx.lineTo(-L * 0.02, -L * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(L * 0.05, L * 0.1);
        ctx.lineTo(-L * 0.12, L * 0.24 - flap);
        ctx.lineTo(-L * 0.02, L * 0.08);
        ctx.closePath();
        ctx.fill();
        // 描邊＋眼睛（像魚的關鍵兩筆）
        ctx.strokeStyle = 'rgba(90,40,20,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, L * 0.5, L * 0.165, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(20,12,8,0.9)';
        ctx.beginPath();
        ctx.arc(L * 0.36, -L * 0.045, Math.max(1.2, L * 0.022), 0, Math.PI * 2);
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

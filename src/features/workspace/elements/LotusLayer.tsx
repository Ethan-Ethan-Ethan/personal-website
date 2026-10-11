import { useEffect, useRef } from 'react';
import { RIVERBED_PATH } from '../core/lake-assets';
import { lotusLightFilter } from '../core/lake-light';

type Props = { light: number };

// 荷葉浮層：直接從底圖 pond-02 裁荷葉區，同一張照片保證不違和。
// 蓋放位置用跟水 shader 同一套 cover 映射，靜止時像素對齊；微漂 ±3px 看起來像浮動。
// z 在最頂（含 UI 之上），魚從葉底游過。減動畫時靜止一幀。
const CROPS = [
  { fx: 0, fy: 0.02, fw: 0.3, fh: 0.96, phase: 0 },
  { fx: 0.76, fy: 0.02, fw: 0.24, fh: 0.96, phase: 2.1 },
];

type Crop = { c: HTMLCanvasElement; fx: number; fy: number; fw: number; fh: number; phase: number };

function featheredCrop(
  bed: HTMLImageElement,
  fx: number,
  fy: number,
  fw: number,
  fh: number,
  feather: number,
): HTMLCanvasElement | null {
  try {
    const w = Math.max(1, Math.round(bed.naturalWidth * fw));
    const h = Math.max(1, Math.round(bed.naturalHeight * fh));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    if (!g) return null;
    g.drawImage(bed, fx * bed.naturalWidth, fy * bed.naturalHeight, w, h, 0, 0, w, h);
    const m = document.createElement('canvas');
    m.width = w;
    m.height = h;
    const mg = m.getContext('2d');
    if (!mg) return c;
    mg.filter = `blur(${feather}px)`;
    mg.fillStyle = '#fff';
    mg.fillRect(feather, feather, w - feather * 2, h - feather * 2);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(m, 0, 0);
    g.globalCompositeOperation = 'source-over';
    return c;
  } catch {
    return null;
  }
}

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

    let crops: Crop[] = [];
    let texAspect = 16 / 9;
    // 本地漣漪：自己聽點擊，水波盪開時把附近的葉子推開（跟水 shader 同步感覺）。
    // 座標跟魚層同系（x、y 皆螢幕分數，y 上小下大）。
    type Push = { x: number; y: number; t0: number };
    const pushes: Push[] = [];
    const toLocal = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / Math.max(rect.width, 1),
        y: (clientY - rect.top) / Math.max(rect.height, 1),
      };
    };
    let lastPushAt = -1;
    const t0 = performance.now();
    const onPush = (event: PointerEvent) => {
      const now = (performance.now() - t0) / 1000;
      if (now - lastPushAt < 0.15) return;
      lastPushAt = now;
      const p = toLocal(event.clientX, event.clientY);
      pushes.push({ ...p, t0: now });
      if (pushes.length > 8) pushes.shift();
    };
    host.parentElement?.addEventListener('pointerdown', onPush, { passive: true });
    const img = new Image();
    img.src = RIVERBED_PATH;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        texAspect = img.naturalWidth / img.naturalHeight;
      }
      const out: Crop[] = [];
      for (const r of CROPS) {
        const c = featheredCrop(img, r.fx, r.fy, r.fw, r.fh, 34);
        if (c) out.push({ c, ...r });
      }
      if (out.length > 0) {
        crops = out;
        if (reduced) draw(0);
      }
    };

    let raf = 0;
    let disposed = false;

    const dprOf = () => Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const dpr = dprOf();
      canvas.width = Math.max(1, Math.floor(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(host.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const draw = (t: number) => {
      const dpr = dprOf();
      const W = host.clientWidth;
      const H = host.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (crops.length === 0) return;
      ctx.filter = lotusLightFilter(lightRef.current);
      // 跟 LakeCanvas coverUv 同式：可視區＝中央 ± s/2
      const sax = W / Math.max(H, 1);
      const s = sax > texAspect ? { x: 1, y: texAspect / sax } : { x: sax / texAspect, y: 1 };
      const ox = 0.5 - s.x / 2;
      const oy = 0.5 - s.y / 2;
      for (const r of crops) {
        // 被推開：附近有點擊漣漪時，沿徑向推（0.6 秒衰完，最大約 26px）。
        let pushX = 0;
        let pushY = 0;
        if (!reduced && pushes.length > 0) {
          const nowS = t;
          const ccx = r.fx + r.fw / 2;
          const ccy = r.fy + r.fh / 2;
          for (let i = pushes.length - 1; i >= 0; i--) {
            const p = pushes[i];
            const age = nowS - p.t0;
            if (age > 0.9) {
              pushes.splice(i, 1);
              continue;
            }
            const ddx = ccx - p.x;
            const ddy = (ccy - p.y) * (W / Math.max(H, 1));
            const d = Math.hypot(ddx, ddy);
            if (d < 0.45 && d > 1e-4) {
              const k = (1 - age / 0.9) * Math.exp(-d * d * 18) * 0.05;
              pushX += (ddx / d) * k * W;
              pushY += (ddy / d) * k * H;
            }
          }
        }
        const dx = ((r.fx - ox) / s.x) * W + (reduced ? 0 : Math.sin(t * 0.23 + r.phase) * 0.8) + pushX;
        const dy = ((r.fy - oy) / s.y) * H + (reduced ? 0 : Math.cos(t * 0.19 + r.phase) * 0.5) + pushY;
        const dw = (r.fw / s.x) * W;
        const dh = (r.fh / s.y) * H;
        ctx.drawImage(r.c, dx, dy, dw, dh);
      }
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
      host.parentElement?.removeEventListener('pointerdown', onPush);
      ro.disconnect();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="lotus-layer" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }} />;
}

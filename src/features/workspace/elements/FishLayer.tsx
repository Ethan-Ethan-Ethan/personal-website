import { useEffect, useRef } from 'react';
import { createSchool, stepSchool, type Fish } from '../core/fish-school';
import { FISH_SPRITES } from '../core/fish-sprites';
import { KOI_BLACK_PATH, KOI_SHEET_PATH } from '../core/lake-assets';

type Props = { tint: string; light: number };

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

export default function FishLayer({ tint, light }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef(tint);
  tintRef.current = tint;
  const targetRef = useRef(light);
  targetRef.current = light;
  const curRef = useRef(light);
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
    sheet.src = KOI_SHEET_PATH;
    sheet.onload = () => {
      const keyed = keyOutGreen(sheet);
      if (!keyed) return;
      const out: { c: HTMLCanvasElement; base: number }[] = [];
      for (const s of FISH_SPRITES) {
        let c = document.createElement('canvas');
        c.width = Math.max(1, Math.floor(keyed.width * s.w));
        c.height = Math.max(1, Math.floor(keyed.height * s.h));
        const g = c.getContext('2d');
        if (!g) continue;
        g.drawImage(
          keyed,
          s.x * keyed.width, s.y * keyed.height, c.width, c.height,
          0, 0, c.width, c.height,
        );
        let base = s.base;
        if (base > 0) {
          // 頭朝下 → 垂直翻成頭朝上：全場統一頭上尾下，尾段才彎得對地方。
          const f = document.createElement('canvas');
          f.width = c.width;
          f.height = c.height;
          const fg = f.getContext('2d');
          if (!fg) continue;
          fg.translate(0, c.height);
          fg.scale(1, -1);
          fg.drawImage(c, 0, 0);
          c = f;
          base = -Math.PI / 2;
        }
        out.push({ c, base });
      }
      if (out.length > 0) spritesRef.current = out;
      // 黑鯉獨立圖：同去背，第 0 條魚專用（在用正本＋1）。
      const blackImg = new Image();
      blackImg.src = KOI_BLACK_PATH;
      blackImg.onload = () => {
        if (disposed) return;
        const keyed = keyOutGreen(blackImg);
        if (!keyed) return;
        // 整張即一條（頭朝上），直接用全幅。
        spritesRef.current = [...spritesRef.current.slice(0, 3), { c: keyed, base: -Math.PI / 2 }];
      };
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
      // 亮度跟時段：用小步趨近，避免切段時閃跳。
      curRef.current += (targetRef.current - curRef.current) * (1 - Math.exp(-dt * 3));
      const lightT = Math.min(1, Math.max(0, curRef.current));
      // 夜暗晝亮＋夜退飽和：跟水光同曲線走。
      const dimB = 0.45 + 0.55 * lightT;
      const dimS = 0.7 + 0.4 * lightT;
      const dimFilter = `brightness(${dimB.toFixed(3)}) saturate(${dimS.toFixed(3)}) blur(0.6px)`;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = host.clientWidth;
      const H = host.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const L = Math.min(W, H) * 0.05;
      const frac = (n: number) => n - Math.floor(n);
      const sprites = spritesRef.current;
      for (const [idx, f] of fish.entries()) {
        const x = f.x * W;
        const y = f.y * H;
        const heading = Math.atan2(f.vy, f.vx);
        const wag = Math.sin(t * 9 + f.seed) * 0.55;
        if (sprites.length > 0) {
          // 頭定住＋尾段繞關節轉：關節錨定（非居中），尾源向上多取 3% 蓋住接縫。
          // 第 0 條固定黑鯉（sprites[3]，獨立圖），其餘原色三條輪流。
          const sp = idx === 0 && sprites.length > 3
            ? sprites[3]
            : sprites[Math.abs(Math.floor(f.seed)) % 3];
          const vi = Math.abs(Math.floor(f.seed * 7)) % 4;
          const scale = [0.85, 1.0, 1.15, 1.3][vi];
          const breathe = 1 + 0.02 * Math.sin(t * 3 + f.seed);
          const len = L * 1.75 * breathe * scale;
          const wid = len * (sp.c.width / Math.max(sp.c.height, 1));
          const bodySway = 0;
          const tailWag = Math.sin(t * 9 + f.seed + Math.PI * 0.7) * 0.22;
          const headFrac = 0.8;
          const headLen = len * headFrac;
          const tailLen = len - headLen;
          const overlap = len * 0.03;
          const srcOverlap = 0.03;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(heading - sp.base + bodySway);
          ctx.globalAlpha = 0.93;
          ctx.filter = dimFilter;
          ctx.drawImage(
            sp.c, 0, 0, sp.c.width, sp.c.height * headFrac,
            -wid / 2, -len / 2, wid, headLen,
          );
          ctx.translate(0, -len / 2 + headLen);
          ctx.rotate(tailWag);
          ctx.drawImage(
            sp.c, 0, sp.c.height * (headFrac - srcOverlap), sp.c.width, sp.c.height * (1 - headFrac + srcOverlap),
            -wid / 2, -overlap, wid, tailLen + overlap,
          );
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

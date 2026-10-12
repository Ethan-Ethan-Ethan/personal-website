import { useLayoutEffect, useRef } from 'react';
import SplitText from '../../../components/reactbits/SplitText';
import type { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';
import useReducedMotion from './useReducedMotion';

type Props = {
  data: typeof FORECAST_PLACEHOLDER;
};

const GLASS = 'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl';
const INK = '#ffffff';
const WAVE_D = 'M0,79 C120,60 200,120 300,100 S520,40 640,90 S780,80 835,86';

export default function ForecastGlass({ data }: Props) {
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  // GSAP 錨定生長：原點逐次取房子中心（房子永不在縮放容器內）；gsap 缺席即靜態呈現。
  useLayoutEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    (async () => {
      let gsap: { fromTo: (...args: unknown[]) => void } | null = null;
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
      for (const el of [heroRef.current, stripRef.current, railRef.current]) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.92, y: -10, transformOrigin: `${hx - r.left}px ${hy - r.top}px` },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'expo.out', overwrite: 'auto' }
        );
      }
    })();
    return () => { cancelled = true; };
  }, [reducedMotion]);
  const main = data.railMain;
  return (
    <>
      {/* 深色 veil＋綠紫環境光（參考 forecast-center 深色儀表板底，1357×871 構圖） */}
      <div aria-hidden="true" className="fadein" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'linear-gradient(180deg, rgba(4,18,27,0.72), rgba(4,18,27,0.80))' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45%', height: '55%', pointerEvents: 'none', zIndex: 2, background: 'radial-gradient(closest-side, rgba(52,211,153,0.22), transparent)', filter: 'blur(60px)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '-12%', right: '-6%', width: '50%', height: '60%', pointerEvents: 'none', zIndex: 2, background: 'radial-gradient(closest-side, rgba(167,139,250,0.20), transparent)', filter: 'blur(60px)' }} />
    <section
      aria-label="Forecast"
      // 靜態展示卡：pointerEvents 全 none，點擊穿透給湖面熱區（2026-10-12 hotspot 回歸實證）
      // 生長由上方 GSAP 錨定（原點＝房子中心），此處不掛 CSS scale 類
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}
    >
      <style>{`.forecast-glass{position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.03) 28%,transparent 45%);}@media (prefers-reduced-motion: reduce){.forecast-glass .split-parent,.forecast-glass .split-char,.forecast-glass .split-word{animation:none !important;opacity:1 !important;transform:none !important;}}`}</style>
      <div ref={heroRef} className={`forecast-glass ${GLASS}`} style={{ position: 'absolute', top: '12%', left: '9%', maxWidth: 560, width: 'min(560px, 82vw)', padding: '20px 24px' }}>
        <span
          style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: INK, opacity: 0.85, border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 999, padding: '3px 10px', marginBottom: 12,
          }}
        >
          {data.chip}
        </span>
        <h1 style={{ margin: 0, color: INK, fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.02em', fontWeight: 600 }}>
          {data.heroLines.map((line) =>
            reducedMotion ? (
              <span key={line} style={{ display: 'block' }}>{line}</span>
            ) : (
              <SplitText
                key={line}
                text={line}
                tag="span"
                textAlign="left"
                splitType="chars"
                delay={30}
                duration={0.9}
                ease="power2.out"
                from={{ opacity: 0, y: 18 }}
                to={{ opacity: 1, y: 0 }}
              />
            )
          )}
        </h1>
        <p style={{ margin: '12px 0 0', maxWidth: 480, fontSize: 14, lineHeight: '22px', fontWeight: 500, letterSpacing: '-0.3px', color: 'rgba(255,255,255,0.95)' }}>
          {data.blurb}
        </p>
      </div>
      <div ref={stripRef} className={`forecast-glass ${GLASS}`} aria-label="Hourly forecast" style={{ position: 'absolute', left: '9%', bottom: '8%', width: 'min(780px, 74vw)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {data.temps.map((t, i) => (
            <span key={i} style={{ color: INK, fontSize: 28, fontWeight: 400, letterSpacing: '-0.7px' }}>{t}°</span>
          ))}
        </div>
        <svg viewBox="0 0 835 230" preserveAspectRatio="none" style={{ width: '100%', height: 150, marginTop: 24 }}>
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity=".17" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".6" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <clipPath id="wclip"><rect x="0" y="0" width="835" height="230" className="wipe" /></clipPath>
          </defs>
          <g clipPath="url(#wclip)"><path d={WAVE_D} fill="rgba(255,255,255,.08)" /></g>
          <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="6.2" opacity=".17" pathLength={1} className="draw" />
          <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="4.6" opacity=".26" pathLength={1} className="draw" />
          <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="3.4" pathLength={1} className="draw" />
          <style>{`@keyframes drawLine{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:drawLine 1.6s ease forwards}.wipe{transform:scaleX(0);transform-origin:left;animation:wipeIn 1.2s .9s ease forwards}@keyframes wipeIn{to{transform:scaleX(1)}}@media (prefers-reduced-motion: reduce){.draw,.wipe{animation:none}.draw{stroke-dashoffset:0}.wipe{transform:scaleX(1)}}`}</style>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -18 }}>
          {data.days.map((d, i) => (
            <span
              key={d}
              style={{
                color: i === data.activeDay ? '#fff' : 'rgba(255,255,255,.88)',
                fontWeight: i === data.activeDay ? 600 : 500, fontSize: 15,
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
    <aside
      ref={railRef}
      aria-label="Saved locations"
      className="forecast-rail"
      style={{ position: 'absolute', top: '12%', right: 38, width: 310, display: 'flex', flexDirection: 'column', gap: 14, pointerEvents: 'none', zIndex: 3 }}
    >
      <style>{`@media (max-width: 900px){.forecast-rail{top:auto !important;bottom:150px !important;right:5% !important;left:5% !important;width:auto !important;}}`}</style>
      <div className={`forecast-glass ${GLASS}`} style={{ padding: '18px 20px' }}>
        <div style={{ color: 'rgba(255,255,255,.9)', fontSize: 14, fontWeight: 500 }}>{main.city}</div>
        <div style={{ color: INK, fontSize: 72, fontWeight: 500, letterSpacing: '-3.5px', lineHeight: 1 }}>
          {main.temp}°<span style={{ fontSize: 26 }}>C</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, color: 'rgba(255,255,255,.9)', fontSize: 13, whiteSpace: 'nowrap' }}>
          <span>{main.wind} mph 風速</span>
          <span>{main.humidity}% 濕度</span>
          <span>{main.gust} km/h 陣風</span>
        </div>
      </div>
      {data.cities.map((c) => (
        <div key={c.area} className={`forecast-glass ${GLASS}`} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12 }}>Indonesia／{c.area}</div>
            <div style={{ color: INK, fontSize: 15, fontWeight: 500 }}>{c.cond}</div>
          </div>
          <div style={{ color: INK, fontSize: 24 }}>{c.temp}°</div>
        </div>
      ))}
    </aside>
    </>
  );
}

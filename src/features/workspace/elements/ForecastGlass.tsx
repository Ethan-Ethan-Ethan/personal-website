import SplitText from '../../../components/reactbits/SplitText';
import type { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';
import useReducedMotion from './useReducedMotion';

type Props = {
  data: typeof FORECAST_PLACEHOLDER;
  /** orchestrator 點火後才播字＋波形（單一正本：useForecastEntrance，LakeOverlay 持有）。 */
  live: boolean;
};

const GLASS = 'bg-white/10 border border-white/20 rounded-2xl';
/** 進場完成才掛霧化：動畫中 backdrop-filter 會與位移打架造成兩段跳（2026-10-12 無 blur 對照實證）。 */
const GLASS_BLUR = 'backdrop-blur-md';
const INK = '#ffffff';
const WAVE_D = 'M0,79 C120,60 200,120 300,100 S520,40 640,90 S780,80 835,86';

export default function ForecastGlass({ data, live }: Props) {
  const reducedMotion = useReducedMotion();
  // 字只在 orchestrator 點火且非減動畫時才播（其餘一律靜態字，版式先撐住）。
  const animateText = live && !reducedMotion;
  const glass = `forecast-glass ${GLASS}${live ? ` ${GLASS_BLUR}` : ''}`;
  const main = data.railMain;
  return (
    <>
    <section
      data-entrance="hero"
      aria-label="Forecast"
      // 靜態展示卡：pointerEvents 全 none，點擊穿透給湖面熱區（2026-10-12 hotspot 回歸實證）
      // 進場由 useForecastEntrance 單一 orchestrator 驅動，此處不掛任何動畫
      style={{ position: 'absolute', top: '12%', left: '9%', maxWidth: 560, width: 'min(560px, 82vw)', pointerEvents: 'none', zIndex: 3 }}
    >
      <style>{`.forecast-glass{position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.03) 28%,transparent 45%);}@media (prefers-reduced-motion: reduce){.forecast-glass .split-parent,.forecast-glass .split-char,.forecast-glass .split-word{animation:none !important;opacity:1 !important;transform:none !important;}}`}</style>
      <div className={glass} style={{ padding: '20px 24px' }}>
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
            !animateText ? (
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
      <div className={`${glass}${live ? " chart-live" : ""}`} aria-label="Hourly forecast" style={{ marginTop: 16, padding: '16px 20px' }} data-entrance="strip">
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
          <style>{`@keyframes drawLine{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}.draw{stroke-dasharray:1;stroke-dashoffset:0;}.wipe{transform:scaleX(1);transform-origin:left;}.chart-live .draw{stroke-dashoffset:1;animation:drawLine 1.6s ease forwards;}.chart-live .wipe{transform:scaleX(0);animation:wipeIn 1.2s .9s ease forwards;}@keyframes wipeIn{to{transform:scaleX(1)}}@media (prefers-reduced-motion: reduce){.draw,.wipe,.chart-live .draw,.chart-live .wipe{animation:none}.draw,.chart-live .draw{stroke-dashoffset:0}.wipe,.chart-live .wipe{transform:scaleX(1)}}`}</style>
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
      data-entrance="aside"
      aria-label="Saved locations"
      className="forecast-rail"
      style={{ position: 'absolute', top: '12%', right: 38, width: 300, display: 'flex', flexDirection: 'column', gap: 14, pointerEvents: 'none', zIndex: 3 }}
    >
      <style>{`@media (max-width: 900px){.forecast-rail{top:auto !important;bottom:150px !important;right:5% !important;left:5% !important;width:auto !important;}}`}</style>
      <div className={glass} style={{ padding: '18px 20px' }}>
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
        <div key={c.area} className={glass} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

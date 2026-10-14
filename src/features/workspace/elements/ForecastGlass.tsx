import type { ForecastUIData } from '../core/cwa-forecast';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';
import { wavePath } from '../core/cwa-forecast';

type Props = {
  data: ForecastUIData;
  /** 過場唯一正本：開關只翻 open，所有動畫皆純 CSS（無 JS staging、無掛載開關）。
   * 進場語言對齊 forecast-center 參考編舞：slideL/slideR/riseIn＋mask reveal＋wipe，
   * hero／strip 無玻璃卡（裸字直落背景），玻璃只在 chip／右欄卡／側軌。 */
  open: boolean;
};

const GLASS_BASE = 'bg-white/10 border border-white/20 rounded-2xl';
const GLASS_BLUR = 'backdrop-blur-md';
const INK = '#ffffff';

/** 中日韓字宜正追蹤（全形字 love 間距），拉丁才用負追蹤收緊：有 CJK 即開 0.05em。 */
const hasCjk = (s: string): boolean => /[\u4e00-\u9fff]/.test(s);

/** 開場 stagger（ms，toggle 壓縮版參考 beats）：chip 100 → h1 160/260 → blurb 380 → 右卡 250/320/390/460 → 氣溫 500+i*60 → 波形 700 → 星期 1100+i*55。關閉一律 0ms 同收。 */
const D = { chip: 100, line1: 160, line2: 260, blurb: 380, card0: 250, cardStep: 70, temp0: 500, tempStep: 60, wave: 700, day0: 1100, dayStep: 55 } as const;

export default function ForecastGlass({ data, open }: Props) {
  const main = data.railMain;
  const cjk = data.heroLines.some(hasCjk) || hasCjk(data.blurb);
  const heroTracking = cjk ? '0.05em' : '-0.02em';
  const blurbTracking = cjk ? '0.04em' : '-0.3px';
  const waveD = wavePath(data.temps);
  // blur 與 is-open 原子同 commit：開時才霧化，避免 opacity 跑完才霧化的第二段跳
  const glass = `forecast-glass ${GLASS_BASE}${open ? ` ${GLASS_BLUR}` : ''}`;
  const on = open ? ' is-open' : '';
  const dl = (ms: number): { transitionDelay: string } => ({ transitionDelay: open ? `${ms}ms` : '0ms' });
  return (
    <div className={`forecast-stack${on}`}>
    <section
      aria-label="Forecast"
      className="forecast-hero"
      // hero／strip 無卡：靜態定位殼，pointerEvents 全 none，點擊穿透給湖面熱區（2026-10-12 hotspot 回歸實證）
      style={{ position: 'absolute', top: '12%', left: '9%', pointerEvents: 'none', zIndex: 3 }}
    >
      <style>{`.forecast-hero{max-width:560px;width:min(560px,82vw);}.forecast-stack{display:contents;}@media (max-width:900px),(max-height:500px){.forecast-stack{display:block;position:absolute;inset:0;overflow-y:auto;pointer-events:none;padding:0 0 130px;}.forecast-stack.is-open{pointer-events:auto;}.forecast-stack .forecast-hero{position:static !important;width:auto !important;max-width:none !important;margin:96px 9% 0;}.forecast-stack .forecast-rail{position:static !important;width:auto !important;max-width:none;margin:16px 5% 0;max-height:none;overflow:visible;}}.forecast-glass{position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.03) 28%,transparent 45%);}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}.fc-dir-r{transform:translateX(30px) scale(.985);}.fc-dir-up{transform:translateY(14px);}.fc-wipe-r{clip-path:inset(0 100% 0 0);transform:none;}.fc-wipe-d{clip-path:inset(0 0 100% 0);transform:none;}.mask-line{display:block;overflow:hidden;}.mask-line>span{display:block;transform:translateY(115%);transition:transform 1.05s cubic-bezier(0.16,1,0.3,1);}.mask-line>span.is-open{transform:none;}.fc-day{font-size:15px;}.fc-temp{font-size:28px;}.fc-days-row{display:flex;flex-wrap:wrap;row-gap:6px;}@media (max-width:640px){.fc-day{font-size:12px;letter-spacing:-0.2px;}.fc-temp{font-size:20px;}}@media (min-width:901px) and (max-width:1100px){.forecast-hero{max-width:46vw;}.forecast-rail{width:260px !important;right:20px !important;}}@media (prefers-reduced-motion: reduce){.mask-line>span{transition:none;transform:none;}}`}</style>
      <div style={{ marginBottom: 12 }}>
        <span className={`fc-node fc-wipe-r${on}`} style={{
          display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: INK, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)',
          borderRadius: 999, padding: '3px 10px', ...dl(D.chip),
        }}>
          {data.chip}
        </span>
      </div>
      <h1 style={{ margin: 0, color: INK, fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.02, letterSpacing: heroTracking, fontWeight: 600 }}>
        {data.heroLines.map((line, i) => (
          <span key={line} className="mask-line">
            <span style={{ transitionDelay: open ? `${i === 0 ? D.line1 : D.line2}ms` : '0ms', ...(open ? {} : { transform: 'translateY(115%)' }) }} className={open ? 'is-open' : ''}>{line}</span>
          </span>
        ))}
      </h1>
      <p className={`fc-node fc-wipe-d${on}`} style={{ margin: '12px 0 0', maxWidth: 480, fontSize: 14, lineHeight: '22px', fontWeight: 500, letterSpacing: blurbTracking, color: 'rgba(255,255,255,0.95)', ...dl(D.blurb) }}>
        {data.blurb}
      </p>
      {data.attribution ? (
        <div className={`fc-node fc-wipe-d${on}`} style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)', ...dl(D.blurb) }}>
          {data.attribution}
        </div>
      ) : null}
      <div className={open ? 'is-open' : ''} aria-label="Hourly forecast" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {data.temps.map((t, i) => (
            <span key={i} className={`fc-node fc-dir-up fc-temp${on}`} style={{ color: INK, fontWeight: 400, letterSpacing: '-0.7px', ...dl(D.temp0 + i * D.tempStep) }}>{t}°</span>
          ))}
        </div>
        <svg viewBox="0 0 835 230" preserveAspectRatio="none" className={`fc-node fc-wave${on}`} style={{ width: '100%', height: 150, marginTop: 24 }}>
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity=".17" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".6" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <clipPath id="wclip"><rect x="0" y="0" width="835" height="230" className="wipe" /></clipPath>
          </defs>
          <g clipPath="url(#wclip)"><path d={waveD} fill="rgba(255,255,255,.08)" /></g>
          <path d={waveD} fill="none" stroke="url(#wg)" strokeWidth="6.2" opacity=".17" pathLength={1} className="draw" />
          <path d={waveD} fill="none" stroke="url(#wg)" strokeWidth="4.6" opacity=".26" pathLength={1} className="draw" />
          <path d={waveD} fill="none" stroke="url(#wg)" strokeWidth="3.4" pathLength={1} className="draw" />
          <style>{`@keyframes drawLine{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}.draw{stroke-dasharray:1;stroke-dashoffset:0;}.wipe{transform:scaleX(1);transform-origin:left;}.is-open .draw{stroke-dashoffset:1;animation:drawLine 1.6s ease forwards;animation-delay:${D.wave}ms;}.is-open .wipe{transform:scaleX(0);animation:wipeIn 1.2s ease forwards;animation-delay:${D.wave + 220}ms;}@keyframes wipeIn{to{transform:scaleX(1)}}@media (prefers-reduced-motion: reduce){.draw,.wipe,.is-open .draw,.is-open .wipe{animation:none;animation-delay:0s;}.draw,.is-open .draw{stroke-dashoffset:0;}.wipe,.is-open .wipe{transform:scaleX(1);}}`}</style>
        </svg>
        <div className="fc-days-row" style={{ justifyContent: 'space-between', marginTop: -18 }}>
          {data.days.map((d, i) => (
            <span
              key={d}
              className={`fc-node fc-dir-up fc-day${on}`}
              style={{
                color: i === data.activeDay ? '#fff' : 'rgba(255,255,255,.88)',
                fontWeight: i === data.activeDay ? 600 : 500, ...dl(D.day0 + i * D.dayStep),
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
    <aside
      aria-label="Saved locations"
      className="forecast-rail"
      style={{ position: 'absolute', top: '12%', right: 38, width: 300, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 3, visibility: open ? 'visible' : 'hidden' }}
    >
      <style>{`.forecast-rail{pointer-events:none;max-height:80vh;overflow-y:auto;overflow-x:hidden;}@media (max-width: 900px){.forecast-rail{top:auto !important;bottom:150px !important;right:5% !important;left:5% !important;width:auto !important;max-height:46vh;overflow-y:auto;overflow-x:hidden;pointer-events:auto;}}`}</style>
      <div className={`${glass} fc-node fc-dir-r${on}`} style={{ padding: '18px 20px', ...dl(D.card0) }}>
        <div style={{ color: 'rgba(255,255,255,.9)', fontSize: 14, fontWeight: 500 }}>{main.city}</div>
        <div style={{ color: INK, fontSize: 72, fontWeight: 500, letterSpacing: '-3.5px', lineHeight: 1 }}>
          <span style={{ fontSize: 22, letterSpacing: '0.12em', fontWeight: 500 }}>現在</span>{' '}
          {main.temp}°<span style={{ fontSize: 26 }}>C</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, color: 'rgba(255,255,255,.9)', fontSize: 13, whiteSpace: 'nowrap' }}>
          <span>{main.wind} m/s 風速</span>
          <span>{main.humidity}% 濕度</span>
          <span>{main.pop === null ? "–" : `${main.pop}%`} 降雨機率</span>
        </div>
      </div>
      {data.cities.map((c, i) => (
        <div key={c.area} className={`${glass} fc-node fc-dir-r${on}`} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...dl(D.card0 + (i + 1) * D.cardStep) }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12 }}>臺灣／{c.area}</div>
            <div style={{ color: INK, fontSize: 15, fontWeight: 500 }}>{c.cond}</div>
          </div>
          <div style={{ color: INK, fontSize: 24 }}>{c.temp}°</div>
        </div>
      ))}
    </aside>
    </div>
  );
}

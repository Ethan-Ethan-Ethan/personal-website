import { useEffect, useMemo, useState } from 'react';
import type { LakePhase } from '../core/lake-palette';
import { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';
import { selectForecastData } from '../core/cwa-forecast';
import snapshotDoc from '../core/cwa-snapshot.json';
import { HEXMAP } from '../core/recipe-runtime-binding';
import ForecastGlass from './ForecastGlass';
import ForecastSideRail, { HouseIcon } from './ForecastSideRail';
import GmailPanel from './GmailPanel';
import useReducedMotion from './useReducedMotion';
import SplitText from '../../../components/reactbits/SplitText';
import '../../../components/reactbits/SplitText.css';

const SERIF = 'Georgia, "Times New Roman", "Noto Serif TC", serif';
const INK = '#f5f1e6';

type Props = {
  phase: LakePhase;
  phaseIndex: number;
  phaseCount: number;
  goTo: (i: number) => void;
  trackPlaying: boolean;
  onTogglePlay: () => void;
};

function useLocalTime(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LakeOverlay({ phase, phaseIndex, phaseCount, goTo, trackPlaying, onTogglePlay }: Props) {
  const time = useLocalTime();
  // 動態偏好：使用者開了「減少動態」→ 場景名用靜態字（不播逐字動畫）；跟隨 OS 即時切換。
  const reducedMotion = useReducedMotion();
  // forecast 開關：面板常駐 DOM，開關只翻 open class（全 CSS 過場，無掛載開關、無 JS staging）。
  const [forecastOpen, setForecastOpen] = useState(false);
  // 側軌 active 上提（受控；預設 grid）：mail 掛 GmailPanel，他鍵只亮燈不掛面板（deferred）。
  const [activeId, setActiveId] = useState('grid');
  // 真資料：snapshot 新鮮即用，定位成功換最近縣市；拒絕／超時／SSR 一律回退預設（臺北）→ placeholder。
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    const g = navigator.geolocation;
    if (!g) return;
    g.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { timeout: 6000, maximumAge: 3600000 }
    );
  }, []);
  const forecastData = useMemo(
    () => selectForecastData(snapshotDoc, geo).data ?? FORECAST_PLACEHOLDER,
    [geo]
  );
  useEffect(() => {
    if (!forecastOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setForecastOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forecastOpen]);
  // 連結落點沿用站內既有路由（About→履歷，Selected work→交易實驗室）；可改名。
  // 白噪音現場合成，無檔案無授權問題，播放鍵恆可按。
  const tiny: React.CSSProperties = { fontFamily: SERIF, fontSize: 11, letterSpacing: '0.08em', color: INK, textShadow: '0 1px 8px rgba(0,0,0,0.65)' };
  const link: React.CSSProperties = { ...tiny, textDecoration: 'none', pointerEvents: 'auto' };

  return (
    <div className="lake-overlay" aria-hidden="false" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <style>{`.lake-overlay .fadein{animation:lakefade .6s ease both;}@keyframes lakefade{from{opacity:0;}to{opacity:1;}}@media (prefers-reduced-motion: reduce){.lake-overlay .fadein{animation:none;}}.lake-overlay .dot{transition:width .3s ease,opacity .3s ease;}@media (prefers-reduced-motion: reduce){.lake-overlay .dot{transition:none;}}.lake-overlay .split-parent{margin:0;}.lake-mail-fab{display:none;}@media (max-width: 900px){.lake-mail-fab{display:grid;place-items:center;}}`}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 96, background: 'linear-gradient(to bottom, rgba(0,0,0,0.38), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128, background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)' }} />

      {/* 房子常駐：永不卸載、不進任何動畫容器，開關只動框＋面板（防閃爍） */}
      <button
        type="button"
        aria-label="Ethan 首頁"
        aria-expanded={forecastOpen}
        onClick={() => setForecastOpen((v) => !v)}
        style={{ position: 'absolute', top: 31, left: 35, width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, pointerEvents: 'auto', color: HEXMAP["forecast_ink"], zIndex: 4 }}
      >
        <HouseIcon size={20} />
      </button>
      {/* 手機 Gmail 浮鈕：窄屏專用（≤900px 才顯示，桌機隱藏）；房子鍵下方同槽幾何（同 left/40px 圓）；面板未開直開 mail，面板開著轉收起鍵（關面板，防浮在文字上） */}
      <button
        type="button"
        aria-label={forecastOpen && activeId === 'mail' ? '收起面板' : 'Gmail'}
        className="lake-mail-fab"
        onClick={() => {
          if (forecastOpen && activeId === 'mail') setForecastOpen(false);
          else { setForecastOpen(true); setActiveId('mail'); }
        }}
        style={{ position: 'absolute', top: 79, left: 35, width: 40, height: 40, placeItems: 'center', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', borderRadius: '50%', cursor: 'pointer', padding: 0, pointerEvents: 'auto', color: HEXMAP["forecast_ink"], backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 4 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </button>
      <ForecastSideRail onClose={() => setForecastOpen(false)} open={forecastOpen} activeId={activeId} onSelect={setActiveId} />
      <ForecastGlass data={forecastData} open={forecastOpen && activeId === 'grid'} />
      <GmailPanel open={forecastOpen && activeId === 'mail'} />

      <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 16, alignItems: 'baseline' }}>
        <span style={tiny} aria-label="當地時間">{time}</span>
        <a href="/resume" style={link} onClick={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('open-about-dialog')); }}>About</a>
      </div>

      <div key={phase.id} className="fadein" style={{ position: 'absolute', left: 24, bottom: 24 }}>
        <div style={{ ...tiny, fontSize: 15 }}>
          {reducedMotion ? (
            phase.name
          ) : (
            <SplitText
              text={phase.name}
              tag="p"
              textAlign="left"
              splitType="chars"
              delay={30}
              duration={0.9}
              ease="power2.out"
              from={{ opacity: 0, y: 14 }}
              to={{ opacity: 1, y: 0 }}
            />
          )}
        </div>
        <div style={{ ...tiny, opacity: 0.75 }}>{phase.sub}</div>
      </div>

      <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: '6px 12px', pointerEvents: 'none' }}>
        <div role="group" aria-label="時段選擇" style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: phaseCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`切換到第 ${i + 1} 時段`}
              aria-current={i === phaseIndex ? 'true' : undefined}
              style={{
                width: 32, height: 32, display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer', pointerEvents: 'auto',
              }}
            >
              <span className="dot" style={{ width: i === phaseIndex ? 14 : 5, height: 5, borderRadius: 3, background: INK, opacity: i === phaseIndex ? 1 : 0.65, boxShadow: '0 1px 4px rgba(0,0,0,0.7)' }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={trackPlaying}
          aria-label={trackPlaying ? '暫停水聲' : '播放水聲'}
          title={trackPlaying ? '暫停水聲' : '播放水聲'}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${INK}`,
            background: trackPlaying ? 'rgba(245,241,230,0.18)' : 'rgba(0,0,0,0.30)',
            color: INK, fontSize: 13, cursor: 'pointer', pointerEvents: 'auto',
            textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          }}
        >
          {trackPlaying ? '❚❚' : '▶'}
        </button>
      </div>
    </div>
  );
}

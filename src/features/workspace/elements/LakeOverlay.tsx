import { useEffect, useMemo, useState } from 'react';
import type { LakePhase } from '../core/lake-palette';
import { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';
import { countyByName, nearestCounty, parseCwaWeekly, toForecastData, CWA_DEFAULT_COUNTY, type CwaCounty } from '../core/cwa-forecast';
import snapshotDoc from '../core/cwa-snapshot.json';
import { HEXMAP } from '../core/recipe-runtime-binding';
import ForecastGlass from './ForecastGlass';
import ForecastSideRail, { HouseIcon } from './ForecastSideRail';
import ForecastBottomBar from './ForecastBottomBar';
import GmailPanel from './GmailPanel';
import ArticlePanel from './ArticlePanel';
import TradingPanel from './TradingPanel';
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
  const counties = useMemo(() => {
    try { return parseCwaWeekly(snapshotDoc); } catch { return []; }
  }, []);
  const forecastData = useMemo(() => {
    let main: CwaCounty | null = null;
    if (geo) main = nearestCounty(counties, geo.lat, geo.lon);
    if (!main) main = countyByName(counties, CWA_DEFAULT_COUNTY) ?? counties[0] ?? null;
    if (!main) return FORECAST_PLACEHOLDER;
    const rest = counties.filter((c) => c !== main);
    return toForecastData(main, rest.slice(0, 3));
  }, [geo, counties]);
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
      <style>{`.lake-overlay .fadein{animation:lakefade .6s ease both;}@keyframes lakefade{from{opacity:0;}to{opacity:1;}}@media (prefers-reduced-motion: reduce){.lake-overlay .fadein{animation:none;}}.lake-overlay .dot{transition:width .3s ease,opacity .3s ease;}@media (prefers-reduced-motion: reduce){.lake-overlay .dot{transition:none;}}.lake-overlay .split-parent{margin:0;}@media (max-width: 900px){.lake-phase-label{bottom:96px !important;}.lake-player-cluster{bottom:96px !important;}}`}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 96, background: 'linear-gradient(to bottom, rgba(0,0,0,0.38), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128, background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)' }} />

      {/* 房子常駐：永不卸載、不進任何動畫容器，開關只動框＋面板（防閃爍） */}
      <button
        type="button"
        aria-label="Ethan 首頁"
        aria-expanded={forecastOpen}
        onClick={() => {
          // 房子＝回家＝天氣總覽：打開時一併回 grid；關閉時不動 activeId（只關面板）。
          if (!forecastOpen) { setActiveId('grid'); setForecastOpen(true); }
          else { setForecastOpen(false); }
        }}
        style={{ position: 'absolute', top: 31, left: 35, width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, pointerEvents: 'auto', color: HEXMAP["forecast_ink"], zIndex: 4 }}
      >
        <HouseIcon size={20} />
      </button>
      {/* 手機底欄（≤900px 專用，與側軌同狀態機、互斥顯示；FAB 已退役，見 spec 修訂節） */}
      {/* 底欄點鍵＝選中＋開面板（手機無反應算壞）；桌機側軌維持只切 active 不動 forecastOpen */}
      <ForecastSideRail onClose={() => setForecastOpen(false)} open={forecastOpen} activeId={activeId} onSelect={setActiveId} />
      <ForecastBottomBar activeId={activeId} onSelect={(id) => { setActiveId(id); setForecastOpen(true); }} />
      <ForecastGlass data={forecastData} open={forecastOpen && activeId === 'grid'} />
      <GmailPanel open={forecastOpen && activeId === 'mail'} />
      <ArticlePanel open={forecastOpen && activeId === 'article'} onClose={() => { setActiveId('grid'); setForecastOpen(false); }} />
      <TradingPanel open={forecastOpen && activeId === 'chart'} />

      <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 16, alignItems: 'baseline' }}>
        <span style={tiny} aria-label="當地時間">{time}</span>
        <a href="/resume" style={link} onClick={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('open-about-dialog')); }}>About</a>
      </div>

      <div key={phase.id} className="fadein lake-phase-label" style={{ position: 'absolute', left: 24, bottom: 24 }}>
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

      <div className="lake-player-cluster" style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: '6px 12px', pointerEvents: 'none' }}>
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

import { useEffect, useState } from 'react';
import type { LakePhase } from '../core/lake-palette';
import { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';
import ForecastGlass from './ForecastGlass';
import ForecastSideRail, { HouseIcon } from './ForecastSideRail';
import useForecastEntrance from './useForecastEntrance';
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
  // forecast 面板平常收起不遮魚，點房子鍵才彈出（2026-10-12 使用者回饋）。
  const [forecastOpen, setForecastOpen] = useState(false);
  // 過場唯一正本：開關狀態進 hook，rail→hero→strip→aside 單 timeline 錨定生長，live 再點火字＋波形。
  const panelsLive = useForecastEntrance(forecastOpen);
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
      <style>{`.lake-overlay .fadein{animation:lakefade .6s ease both;}@keyframes lakefade{from{opacity:0;}to{opacity:1;}}@media (prefers-reduced-motion: reduce){.lake-overlay .fadein{animation:none;}}.lake-overlay .dot{transition:width .3s ease,opacity .3s ease;}@media (prefers-reduced-motion: reduce){.lake-overlay .dot{transition:none;}}.lake-overlay .split-parent{margin:0;}`}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 96, background: 'linear-gradient(to bottom, rgba(0,0,0,0.38), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128, background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)' }} />

      {/* 房子常駐：永不卸載、不進任何動畫容器，開關只動框＋面板（防閃爍） */}
      <button
        type="button"
        aria-label="Ethan 首頁"
        aria-expanded={forecastOpen}
        onClick={() => setForecastOpen((v) => !v)}
        style={{ position: 'absolute', top: 31, left: 35, width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, pointerEvents: 'auto', color: INK, zIndex: 4 }}
      >
        <HouseIcon size={24} />
      </button>
      {forecastOpen && (
        <>
          <ForecastSideRail onClose={() => setForecastOpen(false)} />
          <ForecastGlass data={FORECAST_PLACEHOLDER} live={panelsLive} />
        </>
      )}

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

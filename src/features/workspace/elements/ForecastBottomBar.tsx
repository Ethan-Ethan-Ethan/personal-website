import { HEXMAP } from '../core/recipe-runtime-binding';
import { ICONS } from './ForecastSideRail';

const INK = HEXMAP["forecast_ink"];

// 手機專用底部橫式 tab bar（≤900px 才顯示，＞900px 隱藏；與側軌互斥顯示）。
// 六鍵沿側軌 ICONS 語言正本（20px／stroke2／round＋墨色 INK），active 高亮同側軌。
// 玻璃底 blur12＋safe-area inset-bottom；與側軌同狀態機（activeId／onSelect 直通父層）。
// 面板開關沿側軌既有語義：只切 activeId，不動 forecastOpen（開面板走房子鍵，行為不動）。
export default function ForecastBottomBar({ activeId = 'grid', onSelect }: {
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <nav
      aria-label="功能選單"
      className="forecast-bottom-bar"
      style={{
        position: 'absolute', left: 12, right: 12, bottom: 8, zIndex: 4, pointerEvents: 'auto',
        flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-around',
        padding: '8px 4px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <style>{`.forecast-bottom-bar{display:none;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.20);border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);}@media (max-width: 900px){.forecast-bottom-bar{display:flex;}}.forecast-bottom-bar button{transition:background .2s ease,transform .2s ease;}.forecast-bottom-bar button:active{transform:scale(.94);}@media (prefers-reduced-motion: reduce){.forecast-bottom-bar button{transition:none;}}`}</style>
      {ICONS.map((icon) => {
        const isActive = icon.id === activeId;
        return (
          <button
            key={icon.id}
            type="button"
            aria-label={icon.label}
            aria-pressed={isActive}
            onClick={() => onSelect?.(icon.id)}
            style={{
              flex: 1, border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              padding: '6px 0', borderRadius: 14,
              background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
              color: INK, opacity: isActive ? 1 : 0.75,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icon.path}
            </svg>
            <span aria-hidden="true" style={{ fontSize: 10, lineHeight: 1.2, letterSpacing: '0.04em' }}>{icon.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

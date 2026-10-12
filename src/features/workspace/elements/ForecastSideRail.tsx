import { useState } from 'react';
import type { ReactNode } from 'react';

const INK = '#ffffff';

export function HouseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.55))' }}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

type IconDef = { id: string; label: string; path: ReactNode };

const ICONS: IconDef[] = [
  {
    id: 'grid',
    label: '總覽',
    path: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    id: 'chart',
    label: '圖表',
    path: (
      <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M7 13v4" />
        <path d="M12 9v8" />
        <path d="M17 5v12" />
      </>
    ),
  },
  {
    id: 'globe',
    label: '地區',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18Z" />
      </>
    ),
  },
  {
    id: 'calendar',
    label: '日曆',
    path: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 9h18" />
      </>
    ),
  },
  {
    id: 'search',
    label: '搜尋',
    path: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
  },
];

// 左側直式 icon 軌（參考 forecast-center 儀表板側欄風格）：房子鍵收進同一玻璃框頂端，
// 整根為常駐 chrome；點房子開關 forecast 面板（由 LakeOverlay 傳入狀態）。
export default function ForecastSideRail({ homeExpanded, onHomeToggle }: {
  homeExpanded: boolean;
  onHomeToggle: () => void;
}) {
  const [active, setActive] = useState('grid');
  return (
    <nav
      aria-label="功能選單"
      // clip 揭示：只裁 painting、不 transform，房子從第一幀即完整（防跳動）
      className="forecast-side-rail rail-reveal"
      style={{
        position: 'absolute', top: 20, left: 24, zIndex: 3, pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10, transformOrigin: 'top center',
      }}
    >
      <style>{`.forecast-side-rail{background:rgba(255,255,255,0.10);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.20);border-radius:999px;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-side-rail button{transition:background .2s ease,transform .2s ease;}.forecast-side-rail button:hover{background:rgba(255,255,255,0.18);}.forecast-side-rail button:active{transform:scale(.94);}.rail-reveal{animation:railreveal .45s cubic-bezier(0.16,1,0.3,1) both;}@keyframes railreveal{from{clip-path:inset(0 0 100% 0);}to{clip-path:inset(0 0 0 0);}}@media (max-width: 640px){.forecast-side-rail{display:none;}}@media (prefers-reduced-motion: reduce){.forecast-side-rail button{transition:none;}.rail-reveal{animation:none;}}`}</style>
      <button
        type="button"
        aria-label="Ethan 首頁"
        aria-expanded={homeExpanded}
        onClick={onHomeToggle}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center', background: 'transparent', color: INK,
        }}
      >
        <HouseIcon size={24} />
      </button>
      <div aria-hidden="true" style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
      {ICONS.map((icon) => {
        const isActive = icon.id === active;
        return (
          <button
            key={icon.id}
            type="button"
            aria-label={icon.label}
            aria-pressed={isActive}
            onClick={() => setActive(icon.id)}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
              color: INK, opacity: isActive ? 1 : 0.75,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icon.path}
            </svg>
          </button>
        );
      })}
    </nav>
  );
}

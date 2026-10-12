import { useState } from 'react';
import type { ReactNode } from 'react';

const INK = '#ffffff';

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

// 左側直式 icon 軌（參考 forecast-center 儀表板側欄風格）：常駐、可點切換 active，外觀 glimpse，不導航。
export default function ForecastSideRail() {
  const [active, setActive] = useState('grid');
  return (
    <nav
      aria-label="功能選單"
      className="forecast-side-rail"
      style={{
        position: 'absolute', top: 76, left: 24, zIndex: 3, pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6, padding: 10,
      }}
    >
      <style>{`.forecast-side-rail{background:rgba(255,255,255,0.10);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.20);border-radius:999px;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-side-rail button{transition:background .2s ease,transform .2s ease;}.forecast-side-rail button:hover{background:rgba(255,255,255,0.18);}.forecast-side-rail button:active{transform:scale(.94);}@media (max-width: 640px){.forecast-side-rail{display:none;}}@media (prefers-reduced-motion: reduce){.forecast-side-rail button{transition:none;}}`}</style>
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

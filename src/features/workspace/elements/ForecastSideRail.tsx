import type { ReactNode } from 'react';
import { HEXMAP } from '../core/recipe-runtime-binding';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';

const INK = HEXMAP["forecast_ink"];

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

// ICONS 為側軌＋底欄共用語言正本（ForecastBottomBar 唯讀引用，禁 inline 第二份）。
export const ICONS: IconDef[] = [
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
    id: 'mail',
    label: 'Gmail',
    path: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
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

// 左側欄（膠囊佔比＋參考圓角 20px；頂房子槽、中五鍵、底收起鍵）。
// 框體開關由 LakeOverlay 控制；房子常駐框外（同槽幾何），永不卸載防閃爍。
// 底部停在 phase 文字之上（bottom:110），不壓字。
// 路徑依賴標記：muse 原路線五鍵（總覽→圖表→地區→日曆→搜尋）無 Gmail；
// 2026-10-15 用戶拍板次鍵插 Gmail、圖表順延（Gmail 重點閱讀優先於圖表面板）。
// active 上提 LakeOverlay 受控（預設 grid）；他鍵只亮燈不掛面板（deferred，D3 為圖表）。
export type RailId = 'grid' | 'mail' | 'chart' | 'globe' | 'calendar' | 'search';

export default function ForecastSideRail({ onClose, open, activeId = 'grid', onSelect }: {
  onClose: () => void;
  open: boolean;
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <nav
      aria-label="功能選單"
      className={`forecast-side-rail fc-node fc-dir-l${open ? ' is-open' : ''}`}
      style={{
        position: 'absolute', top: 20, bottom: 110, left: 24, width: 60, zIndex: 3, pointerEvents: open ? 'auto' : 'none',
        gap: 6, padding: 10,
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <style>{`.forecast-side-rail{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.20);border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}.fc-dir-up{transform:translateY(14px);}.forecast-side-rail button{transition:background .2s ease,transform .2s ease;}.forecast-side-rail button:hover{background:rgba(255,255,255,0.18);}.forecast-side-rail button:active{transform:scale(.94);}@media (max-width: 900px){.forecast-side-rail{display:none;}}@media (prefers-reduced-motion: reduce){.forecast-side-rail button{transition:none;}}`}</style>
      <div aria-hidden="true" style={{ width: 40, height: 40 }} />
      <div aria-hidden="true" style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
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
      <div aria-hidden="true" style={{ flex: 1 }} />
      <button
        type="button"
        aria-label="收起面板"
        onClick={onClose}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center', background: 'transparent', color: INK, opacity: 0.75,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      </button>
    </nav>
  );
}

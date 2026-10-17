import type { CwaCounty } from '../core/cwa-forecast';
import { countyByName, parseCwaWeekly, toForecastData, CWA_DEFAULT_COUNTY } from '../core/cwa-forecast';
import snapshotDoc from '../core/cwa-snapshot.json';

const COUNTIES: CwaCounty[] = (() => {
  try { return parseCwaWeekly(snapshotDoc); } catch { return []; }
})();

type Props = {
  value: string | null;
  onSelect: (name: string) => void;
};

/** 手動地區選擇：下拉選單列出 22 個台灣縣市，選擇後即時顯示該地當前天氣。不依賴 navigator.geolocation。 */
export default function ForecastRegionPicker({ value, onSelect }: Props) {
  const selected = COUNTIES.find((c) => c.name === value) ?? COUNTIES.find((c) => c.name === CWA_DEFAULT_COUNTY) ?? COUNTIES[0];
  const s0 = selected.slots[0];
  const data = toForecastData(selected, COUNTIES.filter((c) => c !== selected).slice(0, 3));

  return (
    <div style={{ position: 'absolute', top: '12%', left: '9%', right: '9%', zIndex: 5, pointerEvents: 'auto' }}>
      <style>{`
        .region-picker{background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.20);border-radius:12px;padding:14px 16px;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.35);}
        .region-picker label{display:block;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;}
        .region-picker select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.35);background:rgba(0,0,0,0.25);color:#fff;font-size:14px;cursor:pointer;}
        .region-picker select option{background:#11110f;color:#fff;}
        .region-weather{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);}
        .region-weather .city{font-size:16px;font-weight:600;color:#fff;}
        .region-weather .temp{font-size:32px;font-weight:500;letter-spacing:-1.5px;color:#fff;}
        .region-weather .cond{font-size:13px;color:rgba(255,255,255,0.9);margin-top:4px;}
      `}</style>
      <div className="region-picker">
        <label>手動選地區</label>
        <select value={value ?? ''} onChange={(e) => onSelect(e.target.value)} aria-label="縣市選擇">
          {COUNTIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="region-weather">
          <div className="city">{selected.name}</div>
          <div className="temp">{s0?.temp ?? 0}°C</div>
          <div className="cond">{s0?.wx ?? '–'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
            {data.attribution}
          </div>
        </div>
      </div>
    </div>
  );
}

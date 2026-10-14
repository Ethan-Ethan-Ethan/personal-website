/**
 * cwa-forecast.ts — 中央氣象署開放資料（F-D0047-091，逐12小時1週預報）→ forecast UI 資料。
 * 純函式（可單測）；IO（抓取＋落地）在 scripts/sync-cwa.mjs。
 * key 永不進 repo：sync 讀環境變數 CWA_API_KEY（Keychain），落地只有去 key 的 snapshot。
 */

export type CwaSlot = {
  start: string;
  end: string;
  temp: number;
  maxT: number;
  minT: number;
  rh: number;
  wind: number;
  beaufort: number;
  pop: number | null;
  wx: string;
  wxCode: string;
  ci: string;
};

export type CwaCounty = {
  name: string;
  lat: number;
  lon: number;
  slots: CwaSlot[];
};

export type ForecastCity = { area: string; cond: string; temp: number };

export type ForecastUIData = {
  chip: string;
  heroLines: [string, string];
  blurb: string;
  temps: number[];
  days: string[];
  activeDay: number;
  railMain: { city: string; temp: number; wind: number; humidity: number; pop: number | null };
  cities: ForecastCity[];
  attribution?: string;
};

export const CWA_ATTRIBUTION = "資料來源：中央氣象署開放資料平臺";
export const CWA_DATASTORE = "F-D0047-091";
/** snapshot 過期門檻：逐12小時報，36h 未更新即回退 placeholder。 */
export const CWA_STALE_AFTER_MS = 36 * 3600 * 1000;
export const CWA_DEFAULT_COUNTY = "臺北市";

type RawValue = Record<string, string>;
type RawTime = { StartTime: string; EndTime: string; ElementValue: RawValue[] };
type RawElement = { ElementName: string; Time: RawTime[] };
type RawLocation = {
  LocationName: string;
  Latitude: string;
  Longitude: string;
  WeatherElement: RawElement[];
};

const num = (v: unknown): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`cwa: 非數值 ${JSON.stringify(v)}`);
  return n;
};

/** 遠期 PoP 官方給 "-"（未提供）：誠實 null，不編值、不丟整縣。 */
const numOrNull = (v: unknown): number | null => {
  if (v === "-" || v === "") return null;
  return num(v);
};

/** 風速/蒲福官方偶用邊界記法（"<= 1"／">= 11"）：取界整數（顯示用，不編精度）。 */
const numBound = (v: unknown): number => {
  if (typeof v === "string") {
    const m = v.match(/^(?:<=|>=)\s*(\d+(?:\.\d+)?)$/);
    if (m) return num(m[1]);
  }
  return num(v);
};

function elementOf(loc: RawLocation, name: string): RawElement {
  const el = loc.WeatherElement.find((e) => e.ElementName === name);
  if (!el || !Array.isArray(el.Time) || el.Time.length === 0) {
    throw new Error(`cwa: ${loc.LocationName} 缺 ${name}`);
  }
  return el;
}

function val(el: RawElement, i: number, key: string): string {
  const v = el.Time[i]?.ElementValue?.[0]?.[key];
  if (v === undefined) throw new Error(`cwa: ${el.ElementName}[${i}] 缺 ${key}`);
  return v;
}

function parseLocation(loc: RawLocation): CwaCounty {
  const n = elementOf(loc, "平均溫度").Time.length;
  const get = (name: string) => elementOf(loc, name);
  const avgT = get("平均溫度");
  const maxT = get("最高溫度");
  const minT = get("最低溫度");
  const rh = get("平均相對濕度");
  const wind = get("風速");
  const pop = get("12小時降雨機率");
  const wx = get("天氣現象");
  const ci = get("最大舒適度指數");
  const slots: CwaSlot[] = [];
  for (let i = 0; i < n; i++) {
    slots.push({
      start: avgT.Time[i].StartTime,
      end: avgT.Time[i].EndTime,
      temp: num(val(avgT, i, "Temperature")),
      maxT: num(val(maxT, i, "MaxTemperature")),
      minT: num(val(minT, i, "MinTemperature")),
      rh: num(val(rh, i, "RelativeHumidity")),
      wind: numBound(val(wind, i, "WindSpeed")),
      beaufort: numBound(val(wind, i, "BeaufortScale")),
      pop: numOrNull(val(pop, i, "ProbabilityOfPrecipitation")),
      wx: val(wx, i, "Weather"),
      wxCode: val(wx, i, "WeatherCode"),
      ci: val(ci, i, "MaxComfortIndexDescription"),
    });
  }
  return {
    name: loc.LocationName,
    lat: num(loc.Latitude),
    lon: num(loc.Longitude),
    slots,
  };
}

/** 解析 F-D0047-091 原始回應；success 非 true 或形狀不合即 throw（fail-closed，不猜值）。 */
export function parseCwaWeekly(raw: unknown): CwaCounty[] {
  const r = raw as {
    success?: unknown;
    records?: { Locations?: Array<{ Location?: RawLocation[] }> };
  } | null;
  if (!r || r.success !== "true") throw new Error("cwa: success 非 true");
  const locs = r.records?.Locations?.[0]?.Location;
  if (!Array.isArray(locs) || locs.length === 0) throw new Error("cwa: 無 Location");
  return locs.map(parseLocation);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** 最近縣市；空集合回 null（呼叫端回退預設）。 */
export function nearestCounty(counties: CwaCounty[], lat: number, lon: number): CwaCounty | null {
  let best: CwaCounty | null = null;
  let bestD = Infinity;
  for (const c of counties) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function countyByName(counties: CwaCounty[], name: string): CwaCounty | null {
  return counties.find((c) => c.name === name) ?? null;
}

/** 依距指定點由近到遠排序（不動原陣列）。 */
export function sortByDistance(counties: CwaCounty[], lat: number, lon: number): CwaCounty[] {
  return [...counties].sort(
    (a, b) =>
      haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon)
  );
}

export type SnapshotDoc = {
  fetchedAt?: unknown;
  success?: unknown;
  records?: unknown;
  attribution?: unknown;
};

export type SelectResult =
  | { data: ForecastUIData; source: "cwa" }
  | { data: null; source: "placeholder"; reason: "no-snapshot" | "stale" | "parse-error" | "empty" };

/**
 * snapshot＋定位→ UI 資料選擇（含新鮮度門＋回退，純函式可測）。
 * geo 缺席（SSR／拒絕／超時）一律回退預設縣市，不猜使用者位置。
 */
export function selectForecastData(
  doc: SnapshotDoc | null | undefined,
  geo: { lat: number; lon: number } | null
): SelectResult {
  if (!doc || typeof doc !== "object") return { data: null, source: "placeholder", reason: "no-snapshot" };
  const age = Date.now() - Date.parse(String(doc.fetchedAt));
  if (!Number.isFinite(age) || age > CWA_STALE_AFTER_MS || age < 0)
    return { data: null, source: "placeholder", reason: "stale" };
  let counties: CwaCounty[];
  try {
    counties = parseCwaWeekly(doc);
  } catch {
    return { data: null, source: "placeholder", reason: "parse-error" };
  }
  if (counties.length === 0) return { data: null, source: "placeholder", reason: "empty" };
  const taipei = countyByName(counties, CWA_DEFAULT_COUNTY);
  let main = taipei ?? counties[0];
  if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)) {
    main = nearestCounty(counties, geo.lat, geo.lon) ?? main;
  }
  const rest = counties.filter((c) => c !== main);
  const ordered =
    geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)
      ? sortByDistance(rest, geo.lat, geo.lon)
      : rest;
  const data = toForecastData(main, ordered.slice(0, 3));
  if (typeof doc.attribution === "string" && doc.attribution) data.attribution = doc.attribution;
  return { data, source: "cwa" };
}

const weekdayEn = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Taipei" });

/** 縣市＋候選城市 → forecast UI 資料（temps 取前 6 個 12h 均溫；days 取覆蓋日期的星期）。 */
export function toForecastData(main: CwaCounty, others: CwaCounty[]): ForecastUIData {
  const s0 = main.slots[0];
  if (!s0) throw new Error(`cwa: ${main.name} 無 slots`);
  const seen: string[] = [];
  for (const s of main.slots) {
    const d = weekdayEn.format(new Date(s.start));
    if (!seen.includes(d)) seen.push(d);
  }
  return {
    chip: "Weather Forecast",
    heroLines: [s0.wx, main.name],
    blurb: `${s0.wx}，${s0.ci}。`,
    temps: main.slots.slice(0, 6).map((s) => s.temp),
    days: seen.slice(0, 7),
    activeDay: 0,
    railMain: { city: main.name, temp: s0.temp, wind: s0.wind, humidity: s0.rh, pop: s0.pop },
    cities: others.slice(0, 3).map((c) => ({
      area: c.name,
      cond: c.slots[0]?.wx ?? "",
      temp: c.slots[0]?.temp ?? 0,
    })),
    attribution: CWA_ATTRIBUTION,
  };
}

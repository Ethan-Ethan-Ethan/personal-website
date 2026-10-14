// forecast-placeholder.ts — forecast glass dashboard placeholder 資料常數（回退用，介面與真資料同形）。
// 真資料走 cwa-snapshot.json（scripts/sync-cwa.mjs 抓取）＋cwa-forecast.selectForecastData 選擇；
// 本檔只在 snapshot 缺失/過期/解析失敗時使用（fail-closed 回退）。品牌為房子 SVG（見 ForecastSideRail.HouseIcon），無圖片常數。
export const FORECAST_PLACEHOLDER = {
  chip: "Weather Forecast",
  heroLines: ["Strom", "with Heavy Rain"],
  blurb: "Partly cloudy with occasional snow showers.",
  temps: [11, 13, 14, 10, 19, 12],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  activeDay: 3,
  railMain: { city: "Central Jakarta", temp: 10, wind: 19, humidity: 40, pop: 15 },
  cities: [
    { area: "North Jakarta", cond: "Mostly Sunny", temp: 12 },
    { area: "Bandung", cond: "Cloudy", temp: 10 },
    { area: "South Jakarta", cond: "Sunny", temp: 14 },
  ],
} as const;

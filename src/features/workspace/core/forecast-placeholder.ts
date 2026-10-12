// forecast-placeholder.ts — forecast glass dashboard 全 placeholder 資料常數（單一正本，介面已鎖定）。
// 後補真資料只改此檔（同欄位、同型別，不動消費端）；品牌為房子 SVG（見 ForecastSideRail.HouseIcon），無圖片常數。
export const FORECAST_PLACEHOLDER = {
  chip: "Weather Forecast",
  heroLines: ["Strom", "with Heavy Rain"],
  blurb: "Partly cloudy with occasional snow showers.",
  temps: [11, 13, 14, 10, 19, 12],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  activeDay: 3,
  railMain: { city: "Central Jakarta", temp: 10, wind: 19, humidity: 40, gust: 15 },
  cities: [
    { area: "North Jakarta", cond: "Mostly Sunny", temp: 12 },
    { area: "Bandung", cond: "Cloudy", temp: 10 },
    { area: "South Jakarta", cond: "Sunny", temp: 14 },
  ],
} as const;

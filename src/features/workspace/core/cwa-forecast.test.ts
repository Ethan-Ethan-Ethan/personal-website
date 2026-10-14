// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  countyByName,
  nearestCounty,
  parseCwaWeekly,
  selectForecastData,
  toForecastData,
  type CwaCounty,
} from "./cwa-forecast";
import snapshotDoc from "./cwa-snapshot.json";

// 最小 fixture，形狀逐字抄 F-D0047-091 實測（ElementName／value key 皆實證，見 2026-10-14 事件）。
const RAW = {
  success: "true",
  records: {
    Locations: [
      {
        DatasetDescription: "臺灣各縣市鄉鎮未來1週逐12小時天氣預報",
        LocationsName: "台灣",
        Location: [
          {
            LocationName: "臺北市",
            Latitude: "25.05",
            Longitude: "121.55",
            WeatherElement: [
              {
                ElementName: "平均溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ Temperature: "26" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ Temperature: "24" }] },
                ],
              },
              {
                ElementName: "最高溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MaxTemperature: "28" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MaxTemperature: "25" }] },
                ],
              },
              {
                ElementName: "最低溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MinTemperature: "23" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MinTemperature: "22" }] },
                ],
              },
              {
                ElementName: "平均相對濕度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ RelativeHumidity: "70" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ RelativeHumidity: "80" }] },
                ],
              },
              {
                ElementName: "風速",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ WindSpeed: "3", BeaufortScale: "2" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ WindSpeed: "2", BeaufortScale: "1" }] },
                ],
              },
              {
                ElementName: "12小時降雨機率",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ ProbabilityOfPrecipitation: "10" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ ProbabilityOfPrecipitation: "0" }] },
                ],
              },
              {
                ElementName: "天氣現象",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ Weather: "晴時多雲", WeatherCode: "02" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ Weather: "多雲", WeatherCode: "04" }] },
                ],
              },
              {
                ElementName: "最大舒適度指數",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MaxComfortIndexDescription: "舒適" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MaxComfortIndexDescription: "舒適" }] },
                ],
              },
            ],
          },
          {
            LocationName: "高雄市",
            Latitude: "22.62",
            Longitude: "120.31",
            WeatherElement: [
              {
                ElementName: "平均溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ Temperature: "29" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ Temperature: "27" }] },
                ],
              },
              {
                ElementName: "最高溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MaxTemperature: "31" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MaxTemperature: "28" }] },
                ],
              },
              {
                ElementName: "最低溫度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MinTemperature: "26" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MinTemperature: "25" }] },
                ],
              },
              {
                ElementName: "平均相對濕度",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ RelativeHumidity: "65" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ RelativeHumidity: "75" }] },
                ],
              },
              {
                ElementName: "風速",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ WindSpeed: "4", BeaufortScale: "3" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ WindSpeed: "3", BeaufortScale: "2" }] },
                ],
              },
              {
                ElementName: "12小時降雨機率",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ ProbabilityOfPrecipitation: "0" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ ProbabilityOfPrecipitation: "0" }] },
                ],
              },
              {
                ElementName: "天氣現象",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ Weather: "晴", WeatherCode: "01" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ Weather: "晴", WeatherCode: "01" }] },
                ],
              },
              {
                ElementName: "最大舒適度指數",
                Time: [
                  { StartTime: "2026-10-14T06:00:00+08:00", EndTime: "2026-10-14T18:00:00+08:00", ElementValue: [{ MaxComfortIndexDescription: "舒適" }] },
                  { StartTime: "2026-10-14T18:00:00+08:00", EndTime: "2026-10-15T06:00:00+08:00", ElementValue: [{ MaxComfortIndexDescription: "舒適" }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

describe("cwa-forecast", () => {
  it("parses counties with slots from real-shaped payload", () => {
    const counties = parseCwaWeekly(RAW);
    expect(counties).toHaveLength(2);
    const tp = countyByName(counties, "臺北市") as CwaCounty;
    expect(tp.slots).toHaveLength(2);
    expect(tp.slots[0]).toMatchObject({ temp: 26, maxT: 28, minT: 23, rh: 70, wind: 3, pop: 10, wx: "晴時多雲", ci: "舒適" });
    expect(tp.lat).toBeCloseTo(25.05, 2);
  });
  it("rejects failed payloads", () => {
    expect(() => parseCwaWeekly({ success: "false" })).toThrow();
    expect(() => parseCwaWeekly(null)).toThrow();
  });
  it("keeps county with null pop when official value is '-'", () => {
    const raw = JSON.parse(JSON.stringify(RAW));
    raw.records.Locations[0].Location[0].WeatherElement.find(
      (e: { ElementName: string }) => e.ElementName === "12小時降雨機率"
    ).Time[0].ElementValue[0].ProbabilityOfPrecipitation = "-";
    const counties = parseCwaWeekly(raw);
    expect(counties[0].slots[0].pop).toBeNull();
    expect(counties[0].slots[1].pop).toBe(0);
  });
  it("parses wind boundary notation as bound integer", () => {
    const raw = JSON.parse(JSON.stringify(RAW));
    const windEl = raw.records.Locations[0].Location[0].WeatherElement.find(
      (e: { ElementName: string }) => e.ElementName === "風速"
    );
    windEl.Time[0].ElementValue[0].WindSpeed = ">= 11";
    windEl.Time[0].ElementValue[0].BeaufortScale = ">= 6";
    windEl.Time[1].ElementValue[0].WindSpeed = "<= 1";
    windEl.Time[1].ElementValue[0].BeaufortScale = "<= 1";
    const counties = parseCwaWeekly(raw);
    expect(counties[0].slots[0]).toMatchObject({ wind: 11, beaufort: 6 });
    expect(counties[0].slots[1]).toMatchObject({ wind: 1, beaufort: 1 });
  });
  it("finds nearest county by haversine", () => {
    const counties = parseCwaWeekly(RAW);
    expect(nearestCounty(counties, 25.06, 121.54)?.name).toBe("臺北市");
    expect(nearestCounty(counties, 22.63, 120.32)?.name).toBe("高雄市");
    expect(nearestCounty([], 25, 121)).toBeNull();
  });
  it("maps county to forecast UI data with attribution", () => {
    const counties = parseCwaWeekly(RAW);
    const tp = countyByName(counties, "臺北市") as CwaCounty;
    const data = toForecastData(tp, [counties[1]]);
    expect(data.heroLines).toEqual(["晴時多雲", "臺北市"]);
    expect(data.temps).toEqual([26, 24]);
    expect(data.railMain).toMatchObject({ city: "臺北市", temp: 26, wind: 3, humidity: 70, pop: 10 });
    expect(data.cities).toHaveLength(1);
    expect(data.cities[0]).toMatchObject({ area: "高雄市", cond: "晴", temp: 29 });
    expect(data.attribution).toContain("中央氣象署");
  });
  it("selects Taipei by default, nearest with geo, placeholder when stale", () => {
    const doc = { ...RAW, fetchedAt: new Date().toISOString() };
    const def = selectForecastData(doc, null);
    expect(def.source).toBe("cwa");
    expect(def.data?.railMain.city).toBe("臺北市");
    expect(def.data?.cities).toHaveLength(1);
    const kh = selectForecastData(doc, { lat: 22.63, lon: 120.32 });
    expect(kh.data?.railMain.city).toBe("高雄市");
    expect(kh.data?.cities[0]?.area).toBe("臺北市");
    expect(selectForecastData(doc, null).data?.attribution).toContain("中央氣象署");
  });
  it("falls back to placeholder on stale/empty/broken snapshot", () => {    expect(selectForecastData(null, null)).toMatchObject({ source: "placeholder", reason: "no-snapshot" });
    expect(
      selectForecastData({ ...RAW, fetchedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString() }, null)
    ).toMatchObject({ source: "placeholder", reason: "stale" });
    expect(selectForecastData({ success: "false", fetchedAt: new Date().toISOString() }, null)).toMatchObject({
      source: "placeholder",
      reason: "parse-error",
    });
  });
  it("committed snapshot parses and selects Taipei by default", () => {
    const counties = parseCwaWeekly(snapshotDoc);
    expect(counties.length).toBeGreaterThanOrEqual(20);
    expect(countyByName(counties, "臺北市")).toBeTruthy();
    const sel = selectForecastData(snapshotDoc, null);
    expect(sel.source).toBe("cwa");
    expect(sel.data?.railMain.city).toBe("臺北市");
    expect(sel.data?.temps).toHaveLength(6);
    expect(sel.data?.days.length).toBeGreaterThanOrEqual(2);
  });
});

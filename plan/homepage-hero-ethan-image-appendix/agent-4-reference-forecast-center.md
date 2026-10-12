# B-leg: forecast-center 參考效果（主 agent 聯網補缺，2026-10-12）

來源（WEB-UNVERIFIED，須與本地實作交叉驗證才可施工）：
- `https://motionsites.org/zh-TW/prompts/forecast-center`（HTML head meta＋體驗證；正文 JS-rendered，markdown fetch 僅殼）
- `https://motionsites.org/prompts/forecast-center`（websearch 摘要）
- `https://goodcase.ai/en/cases/forecast-center`（完整 prompt spec，2026）

## 效果定義（整理後）

- 定位：productivity app screen prompt，深色 glassmorphic＋gradient，green＋purple accents，carousel。
- 參照物：「Aurora Weather / Weather Forecast — Central Jakarta」liquid-glass weather dashboard，單位網格 1357×871。
- HERO（左）：Chip `Weather Forecast`；H1 兩行 `Strom`／`with Heavy Rain`（保留 typo）；blurb 固定文案（Partly cloudy…less than an inch），480u 寬；mask reveal 進場。
- FORECAST STRIP（左下）：氣溫列 `11° 13° 14° 10° 19° 12°`＋SVG wave chart（stroke dash draw-in 再 fill 由左向右 wipe；三層描邊＋fade mask＋clipPath）。
- RIGHT RAIL（右，310u）：Card A（Central Jakarta＋pin，`10°C` 大字，19mph／40%／15km/h）＋ Card B–D（三城市小卡）。
- 材質：liquid glass＝backdrop-filter＋半透明白漸層＋specular sheen（非實心毛玻璃）；無紫色主題污染、無卡片陰影堆疊、無 emoji。
- 動效：carousel、hover、entrance animation、chart draw＋fill。
- 交付形：single self-contained HTML（inline CSS＋SVG sprite，no frameworks，no JS required）；背景可外連 `storm-background.jpg`。

## 對本任務的映射（初步，待設計確認）

- 「左上 Ethan 做成主頁圖片」：對應把 dashboard 內品牌／avatar 槽換成 Ethan 主視覺（圖片＋glass 卡）。
- 「產生該連結的網頁效果」：至少含 dark＋liquid glass＋gradient＋green/purple accents＋entrance＋hover；是否含 forecast strip／right rail／carousel 全套＝範圍待確認（見 synthesis 待釐清 Q1）。
- 「沒資料後續再補」：文案／氣溫／城市全用 placeholder 常數，結構先行，資料介面預留。

B-STOP：缺口（參考效果定義）已關閉，預算使用 2/8，早停。

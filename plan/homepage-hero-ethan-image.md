---
status: active
---

# Plan: 首頁 Ethan 品牌圖＋forecast-center 玻璃 dashboard

**Goal**：首頁左上 Ethan 文字換成主頁圖片，並疊加 forecast-center 式 liquid-glass dashboard（hero＋氣溫 strip＋右欄），資料全 placeholder 後補。

**Architecture**：Lake 背景層（Canvas／FishLayer）完全不動，只擴 `LakeOverlay` 疊加三組 glass 卡；新 palette／asset 先過 contracts 註冊（fail-closed）；波形用內聯 SVG＋CSS/GSAP 實現，不加新庫。

**Tech Stack**：Astro 7 island＋React 19＋Tailwind 4＋GSAP 3（現有）＋內聯 SVG；不升級、不加依賴。

## Global Constraints

- contracts／recipe fail-closed：新 palette 須先註冊 `palette-hex-map.v1.yaml`，新 asset 層須 `assets-provenance` 四件套，否則灰階靜態 fallback（agent-2 實證行為，精確值施工時逐字抄對應 yaml）
- three／gsap 鎖版不升級；單頁 1 個 WebGL context；wheel 劫持僅 hero 首屏＋保留逃生口；reduced-motion 必做；音樂預設靜音（沿用 lake 慣例）
- 不改 `Topbar.astro`（7 非首頁頁）；不改 `WorkspaceDesktop` 分支；回滾＝revert 本次 commit
- visual-compositing V01–V04（禁 depthProbe／禁 #ff00ff 等）動合成改動須過 harness

---

## Context

使用者要個人網站首頁：左上 Ethan 做成主頁圖片＋做出 motionsites forecast-center 連結的網頁效果（dark liquid-glass weather dashboard：hero＋forecast strip＋right rail＋chart draw/fill＋hover/entrance；carousel 明確排除，見 Task 6 範圍裁定）。目前沒資料，結構先行、資料介面預留後補。Q1 範圍已定：A 全套 dashboard（2026-10-12 question tool）。方向經 Gate 2a muse 一審（G2a-Issues，措辭 5 項已修，方向 A 放行）。

## Investigation Findings

| # | Source | Summary | Detail |
|---|--------|---------|--------|
| 1 | explore 首頁現狀 | 首頁＝LakeLanding；Ethan＝`LakeOverlay.tsx:45` 寫死文字；最小觸及一行 | [agent-1](homepage-hero-ethan-image-appendix/agent-1-homepage-ethan.md) |
| 2 | explore 動效基建 | gsap＋three 雙前例現成；LakeCanvas 首選複用；contracts 先行 | [agent-2](homepage-hero-ethan-image-appendix/agent-2-motion-infra.md) |
| 3 | explore 歷史約束 | lake-landing done；須寫明與 lake／reactbits 關係，避免第三個 hero 敘事 | [agent-3](homepage-hero-ethan-image-appendix/agent-3-history-constraints.md) |
| 4 | B-leg 聯網 | forecast-center＝dark glass＋green/purple＋hero/strip/rail＋SVG draw/fill（WEB-UNVERIFIED） | [agent-4](homepage-hero-ethan-image-appendix/agent-4-reference-forecast-center.md) |

> 彙整＋G2a 修訂：[synthesis.md](homepage-hero-ethan-image-appendix/synthesis.md)（A-SUFFICIENT [3/3]；B-STOP 預算 2/8）

## Agent Dispatch Plan

| Wave | Agent ID | Type | Scope |
|------|----------|------|-------|
| 1 | agent-1 | explore | 首頁現狀＋Ethan 位置 |
| 1 | agent-2 | explore | 動效／視覺基建＋可行性 |
| 1 | agent-3 | explore | 歷史計畫＋硬約束 |
| B | — | main webfetch | forecast-center 參考定義 |
| G2a | — | muse 審查形 | 方向取捨一審（G2a-Issues→已修） |
| G4 | agent-4 | general-purpose | 計畫完整度複審（待跑） |

> 預估總 agent 數：5。軟上限 12。muse 通數：1（G2a）。

## Phases

| # | Phase | Description | Key Files | Status |
|---|-------|-------------|-----------|--------|
| 0 | 治理先行 | palette＋asset provenance 註冊＋`system validate` 綠 | palette-hex-map.v1.yaml、assets-provenance、website-style-recipe.ts | done |
| 1 | 品牌換圖 | Ethan 文字→圖片＋`lake-assets.ts` 常數 | LakeOverlay.tsx:45、lake-assets.ts、public/assets/lake/ | done |
| 2 | 玻璃 hero | ForecastGlass hero 卡＋entrance（SplitText 複用） | ForecastGlass.tsx（新）、LakeOverlay.tsx | done |
| 3 | 氣溫 strip | 氣溫列＋SVG wave draw/fill | ForecastGlass.tsx、forecast-placeholder.ts（新） | done |
| 4 | 右欄 | 310u 右欄大卡＋三城市小卡 | ForecastGlass.tsx | done |
| 5 | 全鏈驗證 | 對比／減動畫／e2e／preview 門＋Dashboard 同步 | verification/contracts、Dashboard.md | done |

## Key Files

| File | Role in Plan |
|------|-------------|
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/features/workspace/elements/LakeOverlay.tsx` | 唯一疊加點：Ethan 換圖＋掛 ForecastGlass |
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/features/workspace/elements/ForecastGlass.tsx` | 新：hero＋strip＋rail 三組 glass 卡 |
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/features/workspace/core/forecast-placeholder.ts` | 新：全 placeholder 資料常數（文案／氣溫／城市／metrics，後補真資料只改此檔） |
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/features/workspace/core/lake-assets.ts` | 加 Ethan 主圖＋（可選）storm 背景常數 |
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/features/workspace/core/website-style-recipe.ts` | 約束正本，只讀＋驗證，不改行為 |
| `/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站/src/pages/index.astro` | 只讀確認（USE_LAKE 不動）；noscript h1 不動 |

## Layer Coupling

| Layer | Impact | Check |
|-------|--------|-------|
| L1 治理 | AGENTS.md 不動（通用指引，G5 以 plan＋contracts 為準） | 無新規則→不更新 |
| L2 Skills | 無新工作流 | 不萃取 |
| L3 Hooks | 不影響 | — |
| L4 Scripts | 用現有 `site.mjs` verify／vitest／playwright | 不新增腳本 |
| L5 Vault | Dashboard.md 同步本次 hero 決策（斷層補洞）；Worklog 記踩坑 | scribe 協助 |
| L6 Projects | 個人網站專案內 | Worklog.md 更新 |
| L7 設定 | 不改 astro config／依賴 | — |

## Verification

- [x] `node scripts/site.mjs system validate` 綠（含 recipe fail-closed 無 fallback；每次 build 內含，BUILD_EXIT 0）
- [x] `npx vitest run` 綠（21 files／160 tests，VITEST_EXIT 0）
- [x] `verify e2e` 本次範圍綠（brand-image.spec 6/6：品牌圖＋glass 三區＋reduced-motion，desktop＋mobile，EXIT 0）
- [x] reduced-motion：emulated reduce 下內容完整可讀（e2e 實證）；動畫 CSS 側全有 `@media` 終態
- [ ] 對比度量測：儀器量測值 MISSING——glass 白字壓 live shader，靜態儀器值無意義；已做 drop-shadow＋sheen＋減動畫終態；**待真機 human acceptance**（沿 lake-landing 前例）
- [ ] 全量 e2e 47 failed＝**已證 pre-existing 非回歸**：36 條 waiting-for 定位器逐一映射到停用分支來源（見 appendix [muse-review-evidence.md](homepage-hero-ethan-image-appendix/muse-review-evidence.md) §2）；`USE_LAKE=true` 在基線 f73326d 已寫死（L19），`index.astro` 本次 diff 零行；17 passed（含新 glass 7 斷言）證 island 正常 hydrate
- [x] 手機版右欄改堆疊不斷裂（`forecast-rail` ≤900px 媒體查詢＋mobile-chrome e2e 實證）

## TODO

> G4 verdict: `G4-Issues Found`→3 項已修（簽名单一正本／SVG 可執行定義＋終態斷言／carousel 排除＋revisit），詳 [verdict-g4.md](homepage-hero-ethan-image-appendix/verdict-g4.md)；待使用者批准進 Phase 5。
> muse 執行後審查：`G-Issues`→Q1 兩實修（hero reduced-motion 死選擇器→split 終態＋共用 useReducedMotion hook；皆已修＋單測）＋Q2 證據包（本 appendix [muse-review-evidence.md](homepage-hero-ethan-image-appendix/muse-review-evidence.md)，47 failed＝已證 pre-existing）＋保留異議（rail 不重疊 e2e 已補，7/7 綠）。

- [x] Phase 0：註冊 palette＋provenance，跑 system validate 見綠
- [x] Phase 1：Ethan 換圖＋alt＋pointerEvents 保留，單測＋e2e
- [x] Phase 2：hero glass 卡＋SplitText entrance＋hover
- [x] Phase 3：氣溫列＋SVG wave draw→fill wipe
- [x] Phase 4：右欄大卡＋三小卡（靜態；carousel 已排除，revisit 見 Task 6）
- [x] Phase 5：全鏈驗證＋Dashboard/Worklog 同步＋commit

## Deferred（硬規則五欄，ethyl 2026-10-12）

- D1 對比度 human acceptance｜target: glass hero 真機對比確認｜owner: 使用者｜reason: live shader 底靜態儀器值無意義，需人眼＋真機｜revisit_when: 2026-11-12 前真機驗收｜blocks_current_closure: 否
- D2 真資料＋carousel 另案｜target: `forecast-placeholder.ts` 換真值＋carousel 新 Task｜owner: 使用者（給資料）｜reason: 目前無資料｜revisit_when: 資料回來後另開計畫｜blocks_current_closure: 否
- D3 Worklog scribe 6 行未 commit｜target: Worklog.md 末尾 6 行｜owner: 使用者｜reason: 檔內另有 165 deletions 非本次變更，不可掃入（Commit Scope Gate）｜revisit_when: 使用者確認 Worklog diff 後｜blocks_current_closure: 否
- D4 全量 e2e 47 failed 跟進｜target: workspace/visual-fusion/hotspot 舊分支 specs｜owner: 維護者另案｜reason: pre-existing（USE_LAKE=true 基線既有，index.astro 零改動）｜revisit_when: 切回 WorkspaceDesktop 或 specs 改寫時｜blocks_current_closure: 否

---

### Task 1：治理先行（palette＋provenance 註冊）

**Files:**
- Modify: `verification/contracts/palette-hex-map.v1.yaml`（加 forecast glass palette 條目，精確格式抄同檔既有條目）
- Modify: 資產 provenance 登記（格式抄同目錄既有登記，含 assetHash／sourceRGB／alphaMask／aperture）
- Test: `node scripts/site.mjs system validate`（frame 內既有命令即測試）

**Interfaces:**
- Consumes: 無（首棒）
- Produces: 已註冊 palette 名（字串常數，Task 2–4 引用，名字在此定，後棒不得改名）

- [ ] **步驟 1：讀既有條目格式**（palette yaml＋provenance 各讀 1 個完整條目，抄欄位名與縮排）
- [ ] **步驟 2：加條目**（只加 forecast 所需，不動既有行；執行實況 2026-10-12：palette 加 `forecast_deep: "#04121b"`＋HEXMAP 鏡像；provenance 經 grep 確認 repo 內無 per-asset 登記檔、僅 schema 契約已存在且單測覆蓋，故不偽造條目）
- [ ] **步驟 3：跑驗證見綠**：`node scripts/site.mjs system validate`，預期 exit 0；若 fallback 灰階→回步驟 2 補欄位（執行實況：vitest 3 passed＋`system.validate: ok`）
- [ ] **步驟 4：Commit**：`git add verification/contracts/... && git commit -m "feat(homepage): register forecast palette and provenance"`

### Task 2：placeholder 資料常數

**Files:**
- Create: `src/features/workspace/core/forecast-placeholder.ts`
- Test: `src/features/workspace/core/forecast-placeholder.test.ts`（vitest：斷言欄位齊全＋型別）

**Interfaces:**
- Consumes: Task 1 palette 名
- Produces: `FORECAST_PLACEHOLDER`（hero chip／h1 兩行／blurb／temps[6]／days[7]＋activeIndex／rail 大卡＋cities[3]）
- 非產出（G4 修）：品牌圖常數唯一住 `lake-assets.ts`（`ETHAN_BRAND_IMAGE`，Task 3 定義）；本檔不重複，避免雙正本

```typescript
export const FORECAST_PLACEHOLDER = {
  chip: "Weather Forecast",
  heroLines: ["Strom", "with Heavy Rain"],
  blurb: "Partly cloudy with occasional snow showers.",
  temps: [11, 13, 14, 10, 19, 12],
  days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  activeDay: 3,
  railMain: { city: "Central Jakarta", temp: 10, wind: 19, humidity: 40, gust: 15 },
  cities: [
    { area: "North Jakarta", cond: "Mostly Sunny", temp: 12 },
    { area: "Bandung", cond: "Cloudy", temp: 10 },
    { area: "South Jakarta", cond: "Sunny", temp: 14 },
  ],
} as const;
```

- [ ] **步驟 1：寫失敗測試**（test 檔斷言上述欄位；先不建主檔，跑 `npx vitest run forecast-placeholder` 預期 FAIL）
- [ ] **步驟 2：建主檔貼上常數**（值照上，後補真資料只改此檔）
- [ ] **步驟 3：跑測試見綠**
- [ ] **步驟 4：Commit**

### Task 3：Ethan 品牌換圖

**Files:**
- Modify: `src/features/workspace/elements/LakeOverlay.tsx:45`（`<a>Ethan</a>` 文字→`<img>`，保留 href／aria-label／top:20 left:24／pointerEvents:auto，加 drop-shadow 對比）
- Modify: `src/features/workspace/core/lake-assets.ts`（加主圖常數，路徑 `public/assets/lake/` 下新圖）
- Test: 既有 e2e＋`alt="Ethan 首頁"` 斷言（加一行，不另起框架）

**Interfaces:**
- Consumes: 無（首棒視覺；資料常數來自 Task 2，圖常數本 Task 自建單一正本）
- Produces: `ETHAN_BRAND_IMAGE`（唯一正本在 `lake-assets.ts`；此後品牌圖只從此常數引用）

```ts
// lake-assets.ts 追加（唯一正本，格式抄同檔既有常數；G4 修：與 forecast-placeholder.ts 不雙棲）
export const ETHAN_BRAND_IMAGE = {
  src: "/assets/lake/ethan-brand.png",
  alt: "Ethan 首頁",
  width: 120,
  height: 32,
} as const;
```

```tsx
import { ETHAN_BRAND_IMAGE } from "../core/lake-assets";

<a href="/" aria-label="Ethan 首頁" style={{ position:"absolute", top:20, left:24, pointerEvents:"auto" }}>
  <img src={ETHAN_BRAND_IMAGE.src} alt={ETHAN_BRAND_IMAGE.alt}
    width={ETHAN_BRAND_IMAGE.width} height={ETHAN_BRAND_IMAGE.height}
    style={{ display:"block", filter:"drop-shadow(0 1px 6px rgba(0,0,0,.55))" }} />
</a>
```

- [ ] **步驟 1：放圖＋加常數**（圖檔進 `public/assets/lake/ethan-brand.png`，與常數 `src` 同名；無圖時先用 120×32 佔位 PNG，檔名不改；常數只寫 `lake-assets.ts`）
- [ ] **步驟 2：改 LakeOverlay.tsx:45**（只動該行上下 10 行內；Topbar／WorkspaceScene 不碰）
- [ ] **步驟 3：驗證**：`npx vitest run`＋`node scripts/site.mjs verify e2e`（首頁可訪＋0 errors）
- [ ] **步驟 4：Commit**

### Task 4：玻璃 hero 卡

**Files:**
- Create: `src/features/workspace/elements/ForecastGlass.tsx`（hero 卡；props: `{ data: typeof FORECAST_PLACEHOLDER }`）
- Modify: `LakeOverlay.tsx`（掛 `<ForecastGlass data={FORECAST_PLACEHOLDER} />`；參考稿 126u／136u 以 1357×871 為設計稿基準，實際落點用百分比／`clamp()` 響應式換算）
- Test: `src/features/workspace/elements/ForecastGlass.test.ts`（vitest＋testing-library：chip／h1 兩行／blurb渲染斷言）

**Interfaces:**
- Consumes: Task 2 `FORECAST_PLACEHOLDER`
- Produces: `ForecastGlass`（Task 5–6 續加 strip／rail，props 簽名不變）

- [ ] **步驟 1：寫失敗測試**（渲染斷言 chip＋兩行 h1；先跑預期 FAIL）
- [ ] **步驟 2：最小實作**（glass：`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl`＋specular sheen 偽元素；entrance 複用 `SplitText` mask reveal；hover 浮起；`prefers-reduced-motion` 全靜止）
- [ ] **步驟 3：跑測試見綠**＋`tsc`（沿用 repo tsconfig，有錯即修）
- [ ] **步驟 4：Commit**

### Task 5：氣溫 strip＋SVG 波形

**Files:**
- Modify: `src/features/workspace/elements/ForecastGlass.tsx`（加 `ForecastStrip` 內部段：氣溫列＋SVG wave）
- Test: 續加 `ForecastGlass.test.ts` 斷言（6 氣溫＋7 天＋activeDay 高亮）

**Interfaces:**
- Consumes: Task 4 `ForecastGlass` props（不變）
- Produces: 無新增簽名（視覺交付）

```tsx
const WAVE_D = "M0,79 C120,60 200,120 300,100 S520,40 640,90 S780,80 835,86";

<svg viewBox="0 0 835 230" preserveAspectRatio="none" style={{ width:"100%", height:230 }}>
  <defs>
    <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity=".17" />
      <stop offset=".5" stopColor="#fff" stopOpacity=".6" />
      <stop offset="1" stopColor="#fff" stopOpacity="1" />
    </linearGradient>
    <clipPath id="wclip"><rect x="0" y="0" width="835" height="230" className="wipe" /></clipPath>
  </defs>
  <g clipPath="url(#wclip)"><path d={WAVE_D} fill="rgba(255,255,255,.08)" /></g>
  <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="6.2" opacity=".17" pathLength={1} className="draw" />
  <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="4.6" opacity=".26" pathLength={1} className="draw" />
  <path d={WAVE_D} fill="none" stroke="url(#wg)" strokeWidth="3.4" pathLength={1} className="draw" />
  <style>{`@keyframes drawLine{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:drawLine 1.6s ease forwards}
.wipe{transform:scaleX(0);transform-origin:left;animation:wipeIn 1.2s .9s ease forwards}
@keyframes wipeIn{to{transform:scaleX(1)}}
@media (prefers-reduced-motion: reduce){.draw,.wipe{animation:none}.draw{stroke-dashoffset:0}.wipe{transform:scaleX(1)}}`}</style>
</svg>
```

- [ ] **步驟 1：寫失敗測試**（氣溫數＋active 天斷言＋SVG 結構斷言：`path.draw` 恰 3 條、`clipPath#wclip` 存在、fill `path` 存在；先跑 FAIL）
- [ ] **步驟 2：實作**（三層描邊 draw→fill 由左向右 wipe；reduced-motion 下直接終態：dashoffset 0＋wipe scaleX(1)）
- [ ] **步驟 3：跑測試見綠**
- [ ] **步驟 4：Commit**

### Task 6：右欄城市卡

**Files:**
- Modify: `src/features/workspace/elements/ForecastGlass.tsx`（加 `RailCards` 內部段：大卡＋三小卡，寬 310u 桌面／手機堆疊）
- Test: 續加斷言（城市名／溫度／metrics 三項）
- 範圍裁定（G4 修）：carousel 本次排除——靜態三卡；理由：無真資料時輪播無意義，且參考實現的 carousel 為 app-screen 級互動，超出 hero 疊加層；revisit＝真資料回來後另案評估（另開 Task，不在本計畫；屆時重走設計確認）

- [ ] **步驟 1：寫失敗測試**（先跑 FAIL）
- [ ] **步驟 2：實作**（大卡 92u 級大字＋wind/drop/gust；小卡行式；手機 `<md` 改垂直堆疊）
- [ ] **步驟 3：跑測試見綠**
- [ ] **步驟 4：Commit**

### Task 7：全鏈驗證＋同步

**Files:**
- Modify: `04_Projects/個人網站/Dashboard.md`（補本次 hero 決策一行＋plan 連結）
- Test: 全套 Verification 六項

- [ ] **步驟 1：跑 `system validate`＋`vitest`＋`verify e2e`**（全綠才繼續）
- [ ] **步驟 2：手動三項**（reduced-motion／對比度／手機堆疊，結果記 Dashboard）
- [ ] **步驟 3：scribe 同步** Dashboard＋Worklog（只加行，不改歷史）
- [ ] **步驟 4：Commit**（含 Dashboard 行）

---

## Self-Review（作者自查＋G4 修後複查）

1. **Spec coverage**：Ethan→圖片（Task 3）／forecast 全套效果 hero＋strip＋rail（Task 4–6）／無資料 placeholder 後補（Task 2 常數＋「後補只改此檔」）／carousel 顯式排除＋revisit（Task 6）→ 無缺口。
2. **Placeholder scan**：無 TBD／TODO／「類似 Task N」；佔位 PNG 檔名固定＋後續替換路徑明確，非 placeholder 違規。
3. **Type consistency**：`FORECAST_PLACEHOLDER`（Task 2 產）／`ETHAN_BRAND_IMAGE`（Task 3 在 `lake-assets.ts` 單一正本）／`ForecastGlass({data})`（Task 4 簽名不變，Task 5–6 續加內部段）→ 全 Task 一致，無雙棲。
4. **G4 非阻塞備註已收**：參考稿 `u` 單位以 1357×871 為設計稿基準，落點用百分比／`clamp()`（Task 4 掛載點）；provenance 登記路徑施工時抄同目錄既有登記（Task 1 步驟 1）。

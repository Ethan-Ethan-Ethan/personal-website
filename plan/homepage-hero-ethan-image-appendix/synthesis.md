# Phase 2 Synthesis: homepage-hero-ethan-image

A-SUFFICIENT: [3/3] [gaps 0] [recency none] — certified by main agent（Wave 1 三棒全回＋B-leg 關閉參考定義缺口；agent-2 三個未細讀項為非阻塞，按需補）
B-STOP：缺口關閉，預算 2/8，早停。muse 通數：0（Wave 1 廣掃永禁 Muse；使用者「和 muse 規劃」點名保留給 Gate 2a／G4 審查棒）。

## 交叉比對

- confirmed：首頁＝`index.astro`＋LakeLanding 全屏沉浸場景；左上 Ethan＝`LakeOverlay.tsx:45` 寫死文字；動效基建現成（gsap＋three 雙前例＋SplitText 上線）；歷史 lake-landing done＋reactbits Tier0 done；forecast-center＝dark liquid-glass weather dashboard（hero＋strip＋right rail＋chart draw/fill）。
- conflict：無（兩棒對 contracts fail-closed 描述一致；agent-1 覆蓋 Topbar 非首頁、agent-2 覆蓋 recipe 細節，互補）。
- gap：零阻塞。非阻塞三項（hero-001 內容／lake core 逐行／evaluator）動工前按需補。

## 決策理由（design-before-code 步驟 3 預備，三方案；G2a 複審修訂版）

- 方案 A（選定；Q1 書面錨點：使用者 2026-10-12 經 question tool 明確選「A 全套 dashboard」）：Lake 保留＋疊加 forecast 玻璃層。LakeCanvas／FishLayer 不動；`LakeOverlay` 擴充 hero＋strip＋right rail 三組 glass 卡；Ethan 文字→圖片（`public/assets/lake/`＋`lake-assets.ts` 常數）；placeholder 常數後補。取捨：全套範圍內風險可控、與 lake-landing 敘事連續（非「風險最小」——C 純換圖才是最小改）；回滾＝revert 該次改動 commit（註：`USE_LAKE=false` 切的是 WorkspaceDesktop 分支，非本次 revert 路徑）。
- 方案 B（排除）：首頁切換雙版（Lake／Forecast 並存）。取捨：可 AB；代價：維護雙份 hero＋「第三個 hero 敘事」風險（agent-3 連續性警示；「斷層加劇」為推論，非直接證據）。
- 方案 C（排除；成立條件：若使用者只要品牌換圖不要 dashboard，本次不選）：Ethan 純換圖＋玻璃質感微整。取捨：最小改（一行＋asset）；代價：與 Q1-A 期望落差最大。
- 排除：改 Topbar（影響 7 非首頁頁）；升級 three/gsap（鎖版約束）；新動效庫（drei/motion 觸 n-budget gate，agent-2 有據）。
- SVG vs lightweight-charts（G2a 補）：波形 strip 照參考 spec 即內聯 SVG（draw＋wipe），用現有 CSS/GSAP 實現，不加庫；lightweight-charts 僅當未來要「可互動時序圖」才評估（本次無此需求；bundle 已重，agent-2:9-10）。
- right rail 取捨（G2a 補）：Q1-A 含 310u 右欄三城市卡；全屏 Lake 上的佈局／對比評估列為施工期必驗（對比度量測＋真機六門），見主檔 Verification。

## 風險評估

- 高：glass 層與湖面對比（頂部 96px 漸層為文字調的）→ 緩解：圖片自帶對比＋drop-shadow＋對比度量測。
- 高：contracts fail-closed（新 palette／asset 未註冊＝灰階 fallback）→ 緩解：先註冊 `palette-hex-map`＋`assets-provenance` 再動碼。
- 中：三處品牌分叉（Overlay／Topbar／WorkspaceScene）→ 緩解：本次只動 Overlay，其餘 deferred。
- 中：bundle 重量（three＋charts）→ 緩解：chart 用內聯 SVG＋CSS dash 動畫，不加庫。

## 待釐清問題（design-before-code 一次一問，首問＝範圍）

- Q1：首頁要做到 forecast-center 的哪個範圍？（A 全套 dashboard／B 玻璃風格 hero＋strip／C 純換圖微整）——正向使用者提問中，答後定方案進 Gate 2a。

## 證據分欄

- LOCAL-VERIFIED：`src/pages/index.astro:19`（USE_LAKE）、`LakeOverlay.tsx:45`（Ethan 文字）、`LakeCanvas.tsx:25-30,81-134,250`（gsap＋shader）、`SplitText.tsx:12-17,115`、`website-style-recipe.ts`（TABLE 8 鍵／fail-closed）、`plan/lake-landing.md`（done）、`plan/reactbits-personal-website-eval.md`（Tier0 done）。
- WEB-UNVERIFIED（2026-10-12）：motionsites forecast-center 定義（dark glass＋green/purple＋hero/strip/rail＋chart draw/fill；來源 motionsites.org＋goodcase.ai）。
- 衝突判：無（repo 真理本地贏；世界真理＝參考效果掛日期保留，施工前以本地約束為準）。

## 決策樹走向

- Q1 已答（A 全套，2026-10-12 question tool）→ Gate 2a muse 一審回 G2a-Issues（措辭 5 項，見下）→ 已修訂 → 進 Phase 3。

## Gate 2a verdict（留痕）

`G2a-Issues`（muse 審查形，2026-10-12，muse 通數累計 1）：(1)「風險最小」降級為「全套範圍內風險可控」→ 已改；(2)「改回 false 即回滾」誤植分支 → 已改 revert；(3) B 排除「斷層加劇」降級為推論 → 已改；(4) Q1 書面錨點 MISSING → 已補（2026-10-12 question tool 選 A）；(5) SVG vs lightweight-charts 比較 MISSING → 已補；MISSING-3（right rail 佈局／對比評估）→ 收斂為施工期必驗。審查結論「方向 A 可留，修完進 Phase 3／G4，無需重探索」→ 已滿足，放行 Phase 3。

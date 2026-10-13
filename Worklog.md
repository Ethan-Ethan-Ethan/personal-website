---
type: note
project: personal-website
created: 2026-06-15
updated: 2026-09-06
status: seedling
source_exempt: true
---

# Worklog — Personal Website（含 Website Design System）

> 合併專案工作紀錄：原 Personal-Website（Astro 7 重建）+ Website Design System（設計方法論）

## 2026-09-06 Replan 2 — 真實 Window Mask 接入

## 2026-09-06 Replan 3 — 移除實心背景與前景重繪

## 2026-09-06 Replan 4 — 流星位於電腦後方

### 精確需求

完整流星在窗戶內移動；路徑和電腦／玩偶重疊時，由上方透明前景圖自然遮住，不再用 visible-glass mask 預先挖掉電腦形狀。

### 最終合成

```text
reference room
└── geometric window aperture
    └── stars + meteor
        └── unmasked foreground occluder
            └── HTML hotspots
```

### 素材與程式約束

- `window-aperture-v3.png`：visible-glass Alpha 加上 Window box 內被 foreground 遮住的區域。
- `foreground-occluder-v3.webp`：reference PNG RGB＋desktop foreground Alpha。
- `foreground-occluder-mobile-v3.webp`：mobile base RGB＋mobile foreground Alpha。
- Window mask 只套 `.sky-aperture`。
- `.computer-foreground` 不得有 `mask-image`、`clip-path`、父層 opacity 或 blend mode。
- Foreground `z-index:3`；sky `z-index:2`；hotspots `z-index:5`。

### 驗證

| Gate | Result |
|---|---|
| Targeted unit | 7/7 PASS |
| Desktop depth probes | glass visible；wall／monitor／plush blocked |
| Tablet depth probes | glass visible；wall／monitor／plush blocked |
| Playwright | 38 PASS、16 expected skip、0 FAIL |
| Astro build | 860 pages，exit 0 |
| Human visual gate | 待 localhost 目測 |

## 2026-09-06 Replan 5 — 驗證改用真實流星幀

### 舊驗證為何假陽性

- 關閉真正動畫後注入整片 magenta pseudo-element。
- 只檢查四個人工挑選 pixels。
- Visual baseline 未批准，因此 screenshot tests 維持 skip。
- PASS 只能證明 z-index 單點關係，不能證明真實流星路徑與視覺連續性。

### 新驗證契約

- Web Animations API pause＋currentTime 控制真正 `.shooting-star`。
- Progress 0.14–0.86，每 0.02 採樣。
- 四張 paired screenshots 隔離完整 meteor 與 foreground 後的 visible meteor。
- Travel／fade／exit 分段驗證。
- 相對 viewport 最大 meteor pixels 正規化。
- 每個 occluded travel frame 必須以 computer ROI 為主要遮擋來源。
- 最大遮擋不得超過 90%；至少兩幀部分遮擋；late travel 需重新出現。

### 主題修正

```text
短流星 120–210px
└── 長流星 clamp(280px,42%,620px)

viewport translate(-72vw,26vh)
└── scene-relative right/top keyframes
```

實測 travel：

- 初段遮擋率 0%。
- 中段逐步進入 computer ROI，存在多個 partial frames。
- 最大遮擋低於 90%，流星未完全消失。
- Progress 0.64 離開電腦後重新顯示。
- 0.68–0.82 為 aperture exit／fade，不與 foreground occlusion 混為一談。

### Stale preview pitfall

Background Astro dev server 曾未載入最新 CSS；computed style 仍顯示舊 `width:14vw` 與 `translate(-72vw,26vh)`，造成新實作被舊 preview 驗證。修正流程固定為：

```text
CSS 修改
├── 強制重啟 dev server
├── 讀 computed style 確認新值
└── 再跑真實動畫 frame tests
```

### 驗證結果

- Targeted real-frame E2E：Desktop／Tablet PASS。
- Full E2E：38 PASS、16 expected skip、0 FAIL。
- Unit：7/7 PASS。
- Build：860 pages。
- Final reviewer：Approved，無 Critical／Important。

## 2026-09-06 Replan 6 — Tablet Header 造成全場 Blur

### 真正根因

在 808×771 viewport 中檢查所有大型 DOM layer，發現 `.workspace-brand` 實際為 772×418.7，幾乎等於完整 808×454.7 scene。

原因：

```css
@media (max-width:900px) {
  .workspace-brand { inset:18px }
}
```

而 header 同時帶有：

```css
background: rgba(30,25,54,.28);
backdrop-filter: blur(8px);
```

因此使用者看到的不是 Window Alpha mask，而是被拉伸成全場大小的透明模糊導覽列。

### 為何之前漏掉

- 調查集中在 `.sky-aperture`、foreground Alpha、Three.js 與 mask。
- Pixel depth tests 主動隱藏 `.workspace-brand`，所以永遠不會重現全場 blur。
- 原 visual tests 關閉 UI layer，導致真正問題被測試 harness 排除。
- Responsive `.workspace-brand{inset:18px}` 沒有 compact-header regression。

### 修正與驗證

- Tablet header 改為明確 `top/right/left:18px; bottom:auto; height:auto`。
- 新增 808×771 回歸測試：header height <80px，且只位於 scene 上方 100px 範圍。
- RED：418.734px。
- GREEN：compact header PASS。
- Full E2E：39 PASS、17 expected skip、0 FAIL。
- Astro build：860 pages。

## 2026-09-06 現況更新 — 星空與電腦景深

## 問題與解法

### WDS 設計系統

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| WebFetch 無法讀取 CSS styles | 工具只能抓 HTML 結構 | 建立 4 個 console scripts | ✅ |
| Cloudflare 403 攔截個人站分析 | Cloudflare 防護 | 從原始碼直接分析 | ✅ |
| 卡片 padding 不統一（18/20/22/24px） | 無統一 base unit | 4px base → sm/md/lg 命名變數 | ✅ |
| h1 跨頁不一致（28-48px） | 無 typography scale | 定義 --text-xs ~ --text-4xl | ✅ |
| CSS 散落 7 個 HTML 檔 | 無外部樣式表 | 提取為 styles.css + components/*.css | ✅ |
| panel toggle 無鍵盤支援 | 只有 click 事件 | keyboard handler + History API | ✅ |
| rgba 值散落未收斂 | 各處硬編碼 | 定義 --white-04/06/08/12/16 | ✅ |
| 無 scroll 動畫 | 全站 0 個 micro-interaction | IntersectionObserver + CSS transitions | ✅ |
| Hero 缺乏價值主張 | 原始文案為「工作台摘要」 | 重寫 kicker + h1 + lead + trust strip | ✅ |

### Phase 1-3（Astro 重建）

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| RSS XML CDATA 解析失敗 | 自寫解析器未處理 CDATA | 加入 CDATA stripping 函式 | ✅ |
| 中文 slugify 產生空字串 | JS `\w` 不含中文 | regex 加 CJK range `一-鿿` | ✅ |
| Reddit RSS 403 | Reddit 封鎖伺服器端 RSS | 改用 RSSHub 36Kr 源 | ✅ |
| Cloudflare API DNS 權限不足 | Token scope 只給 Workers | 補 Zone DNS Edit 權限 | ✅ |
| Guardrail 擋 rm 指令 | 全域 guardrail 禁止 rm | 改用 trash 指令 | ✅ |

### Phase 4-5

| 問題 | 根因 | 解法 | 結果 |
|------|------|------|------|
| TradingView widget async 載入失敗 | Astro Islands 與 TradingView 非同步初始化衝突 | 改用獨立 iframe 頁面 embed | ✅ |
| RSS 中文標題 slug 路徑衝突 | 動態路由 slug 取自完整檔名路徑 | `post.id.split('/').pop()` 取最後一段 | ✅ |
| GitHub Actions workflow push 權限不足 | GITHUB_TOKEN 預設無 workflow scope | `gh auth refresh -s workflow` 補足 | ✅ |
| gh CLI OAuth token 失效 | macOS Keychain token 過期/SSL 錯誤 | 裝置授權流程重新認證 | ✅ |
| GitHub Secrets 設定混淆 | 誤以為 gh CLI 授權 = 部署權限 | 明確區分兩階段認證 | ✅ |

## 學到的知識

### WDS 設計系統
- 4px base 比 8px 更適合現有奇數值網站的平滑遷移
- WebFetch + console scripts 雙軌分析流程
- Design token 系統化：從散亂值到 CSS 自訂屬性的方法論
- 標竿網站分析框架：10 維度（6 核心視覺 + 4 進階）
- Shadow-as-Border 模式：用 box-shadow 取代 border
- 品牌特徵優先於趨勢：保留 800 weight

### Astro 7 重建
- Astro 7 Content Collections + Cloudflare Pages 部署流程
- 純 Node.js RSS 解析（無外部套件，內建 XML regex parser）
- GitHub Actions 排程觸發 + auto-commit 模式
- Decap CMS 架構（Git-based CMS，純靜態 SPA）
- JavaScript regex 的 `\w` 只管 ASCII，CJK 需手動加 Unicode range
- CDATA 標籤處理是 XML 解析的常見陷阱
- TradingView iframe embed 隔離策略
- Google Apps Script + Gemini API 擷取 Gmail Newsletter
- Astro 動態路由 slug 處理：巢狀目錄需萃取最後一段
- GitHub Actions 的 GITHUB_TOKEN scope 管理
- CI/CD 兩階段認證：gh CLI（推程式碼）≠ Secrets（部署）

### lake-landing 湖面開頭頁（2026-10-08～10-11，未 push，分支 lake-landing）
- 貼圖長寬映射鐵律：直向原圖只能進窄寬高框（`drawImage(sp, -wid/2, -len/2, wid, len)`），長對長、寬對寬；塞反會把魚壓扁拉寬，且與另一處反向筆誤互抵時會「看似正常」，修一半才現形
- 多朝向貼圖正規化：三條魚頭向不一（左下／中上／右下）時，載入期垂直翻成全頭上，尾段關節才彎得對地方；關節用錨定＋上搭 3% 蓋縫，不用居中貼
- 綠幕去背：四角平均取背景色＋42/72 雙門檻羽化＋去綠溢色；小尺寸下光暈會吃掉剪影，shadowBlur 從 5 降到 0
- 魚光跟水光：亮度 0.45＋0.55t／飽和 0.7＋0.4t＋幀內趨近防閃跳；映射太窄（0.16）肉眼無感，拉開才看得出
- 底圖住 shader 裡就別拆三層：bed→魚→水半透要求 bed 獨立成層＝石頭變靜態＋漣漪折射丟失，不划算；魚實體＋光跟走已兩全
- HF musicgen 全系列無 Inference Provider 部署：403 不是授權問題，打勾也沒用，別追同意框；要 AI 音樂走本機跑或 Suno 開帳號
- Agnes 生圖：`agnes-image-3.0` 不存在（503），當期最新 `agnes-image-2.5-flash`；單條主體＋純綠大邊距最好去背
- Astro 換頁水波：`loader`/`swap` 覆寫可做帶石掃場，但出問題即退回（本案已 revert，淡入淡出保留）
- 白噪音水聲可用 WebAudio 現場合成（零檔零授權），但人耳驗收不過即換 AI 音樂，不硬拗
- reviewer 假說要拿原圖驗：Muse 判「中魚轉反」被原圖三朝向證偽，真兇是裁切邊距差；審查意見一律回原圖／行號複驗才收
- 黑鯉策略定案：程式染色（整條染／橘轉黑）全退回，真黑用生圖獨立一張；染色只救急不留檔
- 魚群行為三件套：基礎速度＋burst＋擺尾頻率跟速度走，慢游小擺快游大擺；測試先抓到趨近太弱（修加速度＋驗證窗）
- 底圖住 shader 就別拆三層：bed→魚→水半透要求 bed 獨立＝石頭變靜態＋折射丟失；半透 overlay 另有整屏罩霧坑（blend 連透明區一起算）
- 浮層白邊三段式：羽化→錯位→調色差；根治靠裁切收進葉核＋調色烤進裁切（只切時段重烤）；整屏 multiply 是反模式
- 綠色主體永遠別用綠幕：綠葉去綠幕必吃葉肉，換品紅底一刀乾淨；錦鯉橘白黑沒事是因為色差大
- 守門測試會立功：擋過舊路徑期望、import 掉落、速度上限；留著別刪
- Agnes 當期型號要現查（3.0 不存在／2.5-flash 最新），單主體＋純色大邊距最好去背；單花布局用文字約束（exactly ONE）一次成

## 可引用素材（履歷用）

**一句話描述：**
> 以 Astro + Cloudflare Pages 重建個人網站，建立零成本 RSS 自動聚合管線、Gmail 內容擷取系統與 Git-based CMS 工作流；同時建立網站設計分析系統，分析 5 個標竿網站並提煉 36 個設計模式，完成完整 Design Tokens 規範與 CSS 架構重構。

**技術關鍵字：** Astro 7, Tailwind CSS v4, Cloudflare Pages, GitHub Actions, Decap CMS, Google Apps Script, Gemini API, TradingView / Lightweight Charts, Design System, Design Tokens, DNS 管理, CI/CD, Accessibility (WCAG)

**量化成果：**
- 全站零成本基礎設施（$0/月）
- 5 份標竿分析（2847 行）+ 36 個設計模式（13 分類）
- 4 個分析工具（JS console scripts）
- RSS 管線每日自動聚合 3+ 來源
- Gmail 擷取管線自動提取 Newsletter
- 部署時間從手動 zip 上傳（5-10 min）→ git push 自動部署（< 2 min）
- 35 頁面成功建置，CSS 減少 171 行
- 4 個里程碑全數完成

## 關聯

- 專案主頁：[[Personal Website]]
- 重建計畫：[[網站重建計畫 2026]]
- 踩坑索引：[[04_Projects/知識處理/影片分析工作流/Worklog]]
- RSS 管線：[[RSS 聚合管線-行動流程]]
- 畢業原子筆記：[[第三方 widget 與 SPA 非同步初始化衝突時用 iframe 隔離]]
- 畢業 Reference：[[Personal Website#設計-Tokens]]（Design Tokens 內嵌於專案主頁「設計 Tokens」章節，尚未獨立畢業至 05_Reference）

## 2026-09-06 Replan 7 — Visual DSH 與假通過修復

### 根因

```text
舊驗證假通過
├── rubric 只比對 source token
├── current／candidate 使用不同 oracle
├── candidate 同時擁有 evaluator 與 browser test，可改成 no-op
├── Playwright 只看 exit code，未確認必要測試數
├── dev server 監看測試輸出，可能 HMR reload
└── 固定 time-0 baseline 被後續 raster/compositor 變化污染
```

### 修正

- 新增唯一可演化的 `verification/contracts/visual-compositing/evaluator.ts`。
- `visual-fusion.spec.ts` 與 `workspace.spec.ts` 改為 frozen browser oracle。
- 每個 animation progress 都擷取同時間四張 paired screenshots，不再和早期 baseline 比較。
- DSH shell evaluator 用六組 frozen adversarial evidence 執行真實函式。
- Playwright JSON reporter 精確檢查 Desktop／Tablet meteor 與 Tablet header 的 passed／skipped／unexpected 數量。
- E2E 先 fresh build，再以 Astro static preview 執行；output 移到 TMPDIR，避免 dev HMR。

### 驗證

- Unit：99/99 PASS。
- Full E2E：39 PASS、17 expected skip。
- Stress：Desktop meteor 3 workers × repeat 3，3/3 PASS。
- DSH：current 35/35 PASS；golden-good 35/35 PASS；三份 bad fixture 均 FAIL；leak 0。
- Standalone contracts：PASS。
- Build：860 pages。
- Reviewer：Approved，無 Critical／Important。
- 人工視覺 Gate 尚待使用者確認；不以 DSH 取代溫馨感與構圖審核。

---

## 2026-10-12 hero glass 踩坑（plan/homepage-hero-ethan-image.md，Phase 5 進行中）

- (a) glass 疊加層 `pointerEvents:auto` 擋湖面熱區 → 靜態卡改全 `none` 穿透（品牌 `<a>` 保留 auto 可點；commit `05684d9` 實證）。
- (b) vitest pipefail 陷阱：`| tail` 吃掉非零 exit → 後續一律 `set -o pipefail`＋回報 EXIT（如 VITEST_EXIT／BUILD_EXIT），不只貼 tail 截圖。
- (c) TDD 紅中 commit 一次（strip test 清理缺失）→ fix-forward 補 `b51d221`（jsdom stubs 穩定＋清理）；教訓：EXIT 實證才 commit。

## 2026-10-14 YAML 共用優先補登（使用者裁示，AGENTS.md 已立條文）

- 6 契約登記：recipe-runtime-binding 正式分支（derived_from website-recipe.v1.schema.yaml）；
  其餘 5 標 standalone-experiment（theme-switch 另註 validated 產物 stale；style/demo、recipe
  領域源頭、palette 領域源頭、assets 領域契約）。
- fossil trio：留標本（manifest 加 disposition 欄；trace/validated.yaml 不動；刪需另批）。
- 規則正本：AGENTS.md 正本原則節「YAML 共用優先（2026-10-14）」。

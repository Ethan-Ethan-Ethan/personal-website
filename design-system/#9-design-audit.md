# #9 網站樣式優化 — 設計審計

> 擷取證據：dembrandt v0.30.0，`https://ethanyang.dpdns.org`，8 頁合併 + dark mode。
> 源頭對照：`src/styles/global.css`（設計 tokens 正本）。
> 日期：2026-08-27

## 現狀（設計語言成熟度）

- 深色單模式，語意化 tokens 已成熟：`--color-bg/panel/line/text/muted/soft` + `--color-blue/amber/green/red`。
- 元件模式一致：卡片統一 `rounded-lg bg-panel border-line hover:border-soft`；pill 標籤用 `rounded-full`。
- 字型分層清晰：Inter（UI/標題）+ Source Serif 4（prose 正文）+ JetBrains Mono（code）。
- 結論：**設計語言已相當成熟，優化屬「精煉」層級，而非「補基礎」**。

## 已驗證 OK（不列入優化）

- **對比度（WCAG AA）全過**：text 16.6:1 / muted 9:1 / soft 5.4:1 / amber 8.2:1（對 `#11110f`）。soft 雖偏低但仍 > 4.5:1，無須改。
- **色板凝聚**：暖中性灰 + 藍(primary)/琥珀(accent)/綠/紅，語意明確，無雜色（唯一外來 `#045ede` 來自 TradingView iframe，非本站可控）。
- **元件家族**：卡片 radius/邊框/hover 邏輯已一致。

## 優化機會（優先級）

### A. Focus-visible 全站統一 — 高價值 / 低風險
- 現狀：只有 `.skip-link` 有 focus 樣式；互動卡（index/workbench 卡、PostCard）無可見 focus ring，鍵盤導覽弱。
- 作法：在 `global.css` 加 `:focus-visible { outline: 2px solid var(--color-amber); outline-offset: 2px; }`（accent 色，避開與 border 同色）。
- scope：全局 focus 樣式。out-of-scope：重寫元件結構。

### B. 卡片 hover 抬升邏輯統一 — 低風險
- 現狀：PostCard / index 卡用 `hover:shadow` 抬升，workbench 卡只用 `hover:border-soft`，抬升語意不一致。
- 作法：統一為「border-soft + 輕 shadow」或純 border，二選一貫穿全部卡片。
- scope：hover 視覺。out-of-scope：布局/內容。

### C. Radius 一致性 — 極低風險（cosmetic）
- 現狀：2 處標籤用裸 `rounded`（4px Tailwind 預設），其餘用 token 6/8/12px。
- 作法：`PostCard.astro:44`、`articles/[slug].astro:61` 的 `rounded` → `rounded-sm`。
- scope：2 行。out-of-scope：lg/md 不動。

### D. Light mode 決策 — 策略層級（需使用者拍板）
- 現狀：刻意深色單模式，無 light variant。
- 選項：
  - D1 維持深色單模式（品牌選擇，合理）。
  - D2 加 light mode：`prefers-color-scheme` + 切換鈕，從現有 palette 推導淺色 token（淺 bg / 深 text）。
- 依 `color-mode-and-theme`：只有「使用者控制真的有價值」才加 selector。個人作品集深色優先可接受。
- scope（若做）：新增 light token + toggle。out-of-scope：重寫元件。

### E. 字型 scale 對齊 — 已盤點，結果：乾淨，無須修改
- 盤點方法：grep 全 src 的 `text-[…]` / inline `font-size` / `text-*` token 使用。
- 結果：
  - 全 src **無任意字級**（`text-[…]`、inline `font-size` 均無命中，僅 `global.css` 的 `.prose` 與 `html` 用 `var(--text-*)`）。
  - 所有標題/正文皆用 `text-*` token 工具類（`text-4xl` hero、`text-3xl/2xl/xl/md/sm/xs` 各處），與 token scale 完全對齊。
  - dembrandt 觀察的 `52.5px / 21px` 為 computed 量測值（clamp 解析 + 取樣誤差），源碼無對應 arbitrary px。
- 結論：**字型已對齊 token scale，E 無修改清單**。
- scope：原訂字型一致性。out-of-scope：更換字型。

## 建議執行順序

1. A（focus-visible）— 無爭議、立即提升 a11y 與一致性。
2. B + C — 視覺一致性小修。
3. D — 等使用者決策。
4. E — 盤點後再定。

## 待使用者決策

- 是否實作 A / B / C（建議全做，皆低風險）？
- D：維持深色，或加 light mode？
- 是否要我盤點 E 後給出具體修改清單？

## 實施結果（2026-08-27）

使用者決定：**A + B + C + D2 全做**。

- **A**：`global.css` 加 `:focus-visible { outline: 2px solid var(--color-amber); outline-offset: 2px; }`（accent ring，補鍵盤/無障礙 focus）。
- **B**：定義 `--shadow-card` token（dark `0 8px 24px rgba(0,0,0,0.3)` / light `0 8px 24px rgba(0,0,0,0.12)`）；PostCard 改用 `hover:shadow-card`，index 資料卡與 workbench 卡補 `hover:shadow-card` → 全站卡片 hover 統一為 border-soft + 抬升。
- **C**：`PostCard.astro:44`、`articles/[slug].astro:61` 裸 `rounded` → `rounded-sm`。
- **D2（light mode）**：
  - `global.css` 新增 `[data-theme="light"]` 覆寫全部語意 token：bg `#f4f1e9` / panel `#fff` / panel-2 `#efeadf` / line `#ddd6c7` / text `#1a1a17` / muted `#5f5a4d` / soft `#6f695a` / green `#387024` / amber `#8a5f15` / blue `#2f6f8f` / red `#b1432f` / shadow-card `0.12`。
  - `Topbar.astro` 加 `#theme-toggle` 鈕（顯示切換目標：深色/淺色）＋ 切換＋localStorage 腳本。
  - `BaseLayout.astro` head 內加防 FOUC 初始化腳本（localStorage → 否則 `prefers-color-scheme` → 否則 dark）。
- **驗證**：`astro build` 859 頁通過；Playwright 確認 dark↔light 切換、localStorage 重整後持久化、light tokens 正確套用（bodyBg `rgb(244,241,233)`、card `rgb(255,255,255)`、line `rgb(221,214,199)`、toggle 文字隨模式切換）。
- **備註**：light 模式語意色對比為估算（≥4.5:1 預估通過），建議人工目視最終確認。首頁 VolumeChart 報 `lightweight-charts` module 解析錯誤（預存、非 #9 範圍）。

# G4 verdict（留痕）

`G4-Issues Found`（architect 審查，2026-10-12，subagent ses_ed222163affeIiu37UdrPcDj7p；muse 通數不變 1）。

## 擋項 3 項＋處置（全已修，主檔行號為修後版）

1. `EthanBrandImage` 雙棲（Task 2 Produces vs `lake-assets.ts` 單一正本）→ 修：品牌圖常數唯一住 `lake-assets.ts`（`ETHAN_BRAND_IMAGE` 精確定義見 Task 3）；Task 2 標非產出；snippet 加 import＋欄位引用；Self-Review §3 重寫。
2. Task 5 SVG 不可執行（缺 `#wg` defs／`drawLine` keyframes／三層＋fill 矛盾）→ 修：完整 `<defs>`＋3 描邊＋fill＋wipe＋reduced-motion 終態＋`path.draw`×3／`#wclip`／fill 存在斷言。
3. carousel 無主（Context 含、Task 6 無）→ 修：本次排除＋理由（無真資料）＋revisit（真資料回來後另案）；Context／TODO／Task 6 同步。

## 非阻塞 2 項（已收）

- `u` 單位換算基準（1357×871＋百分比／`clamp()`）→ Task 4 掛載點行。
- provenance 精確檔名 → Task 1 步驟 1（抄既有登記）。

## 查證基座（審查者實讀）

`LakeOverlay.tsx:45`、`lake-assets.ts:1-5`、`website-style-recipe.ts:52-62` 均與計畫引用一致；buildability 基座成立。修後無需重審（擋項全為主檔內定義補完，無新外部依賴），進 Phase 4 使用者批准。

# 水聲（lake-landing Task 7，白噪音合成）

狀態：**已上線，無檔案、無授權問題**。水聲由 WebAudio 現場合成
（白噪音 buffer → 低通濾波 → 慢速 LFO 推濾波頻率），不需任何音檔，
`public/audio/` 保持為空（本文件為唯一內容）。

## 行為

- 首次點擊播放鍵才建 AudioContext（自動播放政策要求手勢解鎖）。
- 切時段：濾波頻率／Q／音量／LFO 以 0.8 秒斜率滑過去，不爆音。
- 四段預設：夜低沉（420Hz）／黃昏暖（700Hz）／黎明清（900Hz）／正午開闊（1400Hz），
  見 `src/features/workspace/core/lake-audio.ts` WATER_VOICES。
- 解除安裝時關 context；減動畫模式不影響聲音（只管動態）。

## 若將來要真錄音

把曲目放 `public/audio/phase-*.mp3` 並在 useLakeAudio 另接 `<audio>` 即可；
本合成器保留作無檔回退。

# 音樂授權門（lake-landing Task 5）

狀態：**未授權，無正式曲目**。`src/features/workspace/core/lake-audio.ts` 的
`AVAILABLE_TRACKS` 為空，播放器呈 disabled（驗收門）；授權確定前不生成、不上架。

## 授權確定後三步

1. 選 AI 生成服務，確認商用條款（Suno／Udio 二選一；條款截圖存本目錄）。
2. 轉檔：`mp3 128k` 起（流量與品質折衷），有餘力加 `opus` 備選。
3. 放檔 `public/audio/phase-{dawn,noon,dusk,night}.mp3`，把 trackId 登入 `AVAILABLE_TRACKS`，播放器自動解鎖。

##  Credits（開源致謝，B 路線波紋做法來源）

- Water ripple interaction: martinRenou/threejs-water（BSD-3-Clause）https://github.com/martinRenou/threejs-water
- Interactive water demo: charlieamer/threejs-water（MIT）https://github.com/charlieamer/threejs-water
- 僅借做法與調參思路，未複製整套；授權全文見各倉庫 LICENSE。

---
title: 你好，世界
description: 第一篇部落格文章，記錄這個網站的誕生與願景
date: 2026-07-11
tags:
  - meta
  - 網站
draft: false
---

## 為什麼要有這個網站？

網路世界日新月異，個人網站反而成了一種珍貴的存在。這個網站不只是部落格，更是一個**自動化內容聚合平台**——文章可以手寫、可以從 Gmail 擷取、量化分析的數據也能自動呈現。

### 三大內容管線

1. **手寫文章** — 本地撰寫、預覽、發布。最純粹的寫作體驗。
2. **Gmail 擷取** — 自動從信箱抓取符合條件的內容，整理後發布。
3. **量化數據** — 交易分析、數據可視化，自動更新展示頁面。

## 技術選型

這個網站使用 [Astro](https://astro.build) 靜態網站產生器，搭配 Markdown 內容管理，部署在 Cloudflare Pages 上。

> 靜態網站的好處：速度快、安全性高、維護成本低。

```javascript
// 一段簡單的範例程式碼
console.log('Hello, World!');

const articles = [
  { title: '你好，世界', date: new Date() },
];

articles.forEach(a => console.log(`📝 ${a.title}`));
```

## 接下來的計畫

Phase 1 完成這個 MVP 後，接下來會：

- Phase 2：Gmail API 串接與內容擷取管線
- Phase 3：量化數據儀表板
- Phase 4：搜尋、標籤雲、RSS 增強

敬請期待 🚀

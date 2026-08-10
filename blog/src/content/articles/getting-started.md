---
title: 開始使用 Astro 建立靜態網站
description: 從零開始，一步步教你如何使用 Astro 框架建立一個現代化的靜態部落格
date: 2026-07-10
tags:
  - Astro
  - 教學
  - Web
draft: false
---

## 為什麼選擇 Astro？

Astro 是一個創新的靜態網站產生器，核心優勢在於：

1. **零 JavaScript 預設** — 預設不傳送任何 JavaScript，頁面極速載入
2. ** Islands 架構** — 只在需要互動的元件載入 JavaScript
3. **Markdown 優先** — 內建對 Markdown 和 MDX 的完美支援
4. **Content Collections** — TypeScript 安全的內容管理系統

## 專案初始化

建立一個新的 Astro 專案非常簡單：

```bash
# 使用 npm 建立專案
npm create astro@latest my-blog

# 進入目錄
cd my-blog

# 啟動開發伺服器
npm run dev
```

### Content Collections

Astro 5 引入了更強大的內容集合系統，讓我們可以用 TypeScript 定義文章的 frontmatter 結構：

```typescript
import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});
```

### 動態路由

建立單篇文章頁面只需要一個檔案，使用 `[...slug].astro` 模式：

- `src/pages/articles/[...slug].astro` — 匹配 `/articles/hello-world` 這類路徑
- 透過 `getCollection()` 查詢所有文章
- 使用 `getEntryBySlug()` 取得單篇文章

## 部署到 Cloudflare Pages

建置完成後，部署到 Cloudflare Pages 只需要：

1. 連接 Git 儲存庫
2. 設定建置指令：`npm run build`
3. 設定輸出目錄：`dist/`

或者使用 Wrangler CLI：

```bash
npx wrangler pages deploy dist/ --project-name=personal-blog
```

## 小結

Astro 是目前建立內容網站的最佳選擇之一。它的學習曲線平緩、效能出色、生態系越來越豐富。接下來我會陸續分享更多實戰經驗，敬請期待。

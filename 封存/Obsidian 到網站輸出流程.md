---
type: reference
status: active
created: 2026-06-18
updated: 2026-07-18
tags:
  - project/personal-website
verification_status: partial
---

# Obsidian 到網站輸出流程

## 目的

把 Obsidian 裡可公開的工作經驗、方法論與心得，穩定輸出到個人網站文章區。

第一階段先維持靜態 HTML，不導入 Astro / Next.js。等文章超過 8-10 篇，再評估是否模板化或自動轉檔。

## 輸出順序

1. Obsidian 筆記
2. Markdown 篩選
3. 脫敏與整理
4. 轉成 HTML
5. 放入網站文章區
6. 更新文章索引與首頁入口
7. 部署與驗證

## 1. Obsidian 筆記

從以下來源挑主題：

- 原子筆記
- MOC
- 工作流程筆記
- 履歷與專案整理
- 日常反思與週報摘要

優先順序：

1. 工作經驗：FAE、硬體研發、NPI、客戶支援、問題分析
2. 投資心得：等有穩定成效或可公開方法後再整理
3. Vlog：最後一層延伸內容

## 2. Markdown 篩選

可公開條件：

- 不含客戶名稱、公司內部資料、產品代號、專案時程、機密數字
- 能獨立閱讀，不需要讀者知道內部背景
- 有方法、判斷流程或可複用觀點
- 能補強履歷之外的工作脈絡

## 3. 脫敏與整理

處理原則：

- 公司 / 客戶 / 產品改成角色或情境描述
- 精確數字改成區間或相對描述
- 保留判斷順序、風險取捨、驗證方式
- 移除內部流程與不可公開資料

## 4. 轉成 HTML

目前文章頁共同欄位：

- `title`
- `description`
- `date`
- `category`
- `tags`
- `previous`
- `next`

網站位置：

- 文章頁：`../website/articles/*.html`
- 文章索引：`../website/articles/index.html`
- 首頁入口：`../website/index.html`

## 5. 更新索引

每新增一篇文章時同步更新：

- `articles/index.html` 新增文章卡片
- 首頁經驗沉澱區視需要新增精選摘要
- 文章上一篇 / 下一篇導覽
- SEO title / description

## 6. 部署

依 [[網站部署 SOP]] 執行 clean staging deploy。

## 7. 發布後記錄

更新：

- [[Personal Website MOC]]
- [[個人網站建置工作流程]]
- `~/Documents/memory.md`

## 相關

- [[個人網站建置工作流程]]
- [[網站部署 SOP]]


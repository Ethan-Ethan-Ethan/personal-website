# 文章與延伸閱讀（article / WIP）

`derived_from: src/features/workspace/core/article-catalog.ts` · `src/features/workspace/core/article-wip.ts`

## 行為

- **湖面書本（文章側欄）**：`index.astro` 從 `posts` 組 `articleCatalog`（`draft: false` 全顯示）；`sortArticleCatalog` 規則：**`pinned: true` 置頂**（置頂內依日期新→舊），其餘依日期新→舊。點標題看摘要 →「閱讀全文」進 `/articles/{slug}`。
- **全文**：`src/content/posts/*.md`；`description` 為側欄摘要與全文頁開場摘要。
- **延伸題（未寫正文）**：登錄 `WIP_NOTES` → `/wip/{slug}` 建構中頁。

## 作者流程

1. 新文：新增 `posts/{slug}.md`（`draft: false`、`title`、`description`、`date`；要置頂加 `pinned: true`）。
2. 延伸題未寫：在 `WIP_NOTES` 加 slug，正文連結 `/wip/{slug}`。
3. 下架：`draft: true` 或刪文（不再出現在側欄與路由）。

## 驗證（oracle）

- `article-catalog.test.ts`：置頂排序。
- `article-wip.test.ts`：WIP slug 唯一；`posts/*.md` 內 `/wip/` 已登錄。
- `verification/e2e/article-routing.spec.ts`：全文路由與 WIP 建構中。

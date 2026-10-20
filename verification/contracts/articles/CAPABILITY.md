# 文章與延伸閱讀（article / WIP）

`derived_from: src/features/workspace/core/article-wip.ts`

## 行為

- **精選主文**：`src/content/posts/*.md`（`draft: false`）+ `article-feature.ts` 定義湖面書本側欄精選與 `/articles/{slug}` 全文。
- **尚無正文的延伸題**：一律登錄 `WIP_NOTES`（`article-wip.ts`），連結只用 `/wip/{slug}`；頁面 `src/pages/wip/[slug].astro` 顯示「建構中」，不得 404。
- **禁止**：正文未寫完卻連到假路徑、空 href，或未登錄 slug 的 `/wip/…`（會 404）。

## 作者流程

1. 日記或主文出現方括號／延伸題且正文未寫 → 在 `WIP_NOTES` 新增 `{ slug, title }`（slug 穩定、kebab-case）。
2. 主文 markdown 用 `[標題](/wip/{slug})`；側欄卡 `article-feature.ts` 的 `related[]` 用 `wipHref(slug)`。
3. 正文完成後：新增 `posts/{slug}.md`、改連結為 `/articles/{slug}`，並可從 `WIP_NOTES` 移除（路由仍保留至下線為止）。

## 驗證（oracle）

- `src/features/workspace/core/article-wip.test.ts`：`WIP_NOTES` slug 唯一；`ARTICLE_FEATURE` 所有 `related.href` 已登錄；`posts/*.md` 內 `/wip/` 連結已登錄。
- `verification/e2e/article-routing.spec.ts`：當期精選全文可開；`/articles/` 列表已退役。

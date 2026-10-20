/** 湖面書本側欄筆記列表（由 index.astro 從 posts 組裝；置頂優先，其餘依日期新→舊）。 */

export type ArticleCatalogEntry = {
  title: string;
  href: string;
  date: string;
  category: string;
  summary: string;
  pinned: boolean;
};

export function sortArticleCatalog(entries: ArticleCatalogEntry[]): ArticleCatalogEntry[] {
  return [...entries].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

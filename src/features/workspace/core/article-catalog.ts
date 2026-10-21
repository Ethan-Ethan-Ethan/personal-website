/** 湖面書本側欄筆記列表（由 index.astro 從 posts 組裝；置頂優先，其餘依日期新→舊）。 */

import type { ArticleLakeCard } from './article-lake-parse';

export type ArticleCatalogEntry = {
  title: string;
  href: string;
  date: string;
  category: string;
  /** 列表摘要；詳情頁「重點」區塊同此（通常為 description）。 */
  summary: string;
  pinned: boolean;
  /** 文首段落（### 之前） */
  intro?: string;
  cards: ArticleLakeCard[];
};

export function sortArticleCatalog(entries: ArticleCatalogEntry[]): ArticleCatalogEntry[] {
  return [...entries].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

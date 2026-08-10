import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

export async function GET(context) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  articles.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description || '',
      link: `/articles/${article.slug}/`,
    })),
    customData: `<language>zh-TW</language>`,
  });
}

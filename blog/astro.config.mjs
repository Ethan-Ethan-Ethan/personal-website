import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com',
  output: 'static',
  integrations: [sitemap()],
  build: {
    // 靜態輸出至 dist/
    format: 'directory',
  },
  markdown: {
    // 啟用語法高亮
    syntaxHighlight: 'prism',
    // 自動產生 heading id 以供目錄錨點
    headingIds: true,
    // 嚴格模式：frontmatter layout 欄位需要正確路徑
    strictFrontmatter: true,
  },
});

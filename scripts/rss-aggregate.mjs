/**
 * RSS 聚合腳本
 * 讀取 rss-feeds.json → 抓取各 feed → 去重 → 產生 Markdown
 * 輸出到 src/content/posts/rss/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts/rss');
const CACHE_FILE = join(ROOT, 'scripts/.rss-cache.json');
const FEEDS_FILE = join(ROOT, 'scripts/rss-feeds.json');

// --- RSS 解析（不依賴外部套件，用內建 fetch + 簡易 XML 解析） ---

async function fetchFeed(feedConfig) {
  const { url, category, tags, maxItems = 10 } = feedConfig;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EthanYangBot/1.0)' },
    });
    if (!res.ok) {
      console.warn(`⚠️  ${url} 回傳 ${res.status}`);
      return [];
    }
    const text = await res.text();
    return parseXML(text, category, tags, maxItems);
  } catch (err) {
    console.warn(`⚠️  ${url} 失敗: ${err.message}`);
    return [];
  }
}

function parseXML(xml, category, tags, maxItems) {
  const items = [];

  // 處理 RSS 2.0 <item>
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const raw of rssItems.slice(0, maxItems)) {
    let title = extractTag(raw, 'title');
    const link = extractTag(raw, 'link');
    const description = stripHtml(extractTag(raw, 'description'));
    const pubDate = extractTag(raw, 'pubDate') || extractTag(raw, 'dc\\:date');
    if (!title && link) {
      try { title = new URL(link).pathname.split('/').filter(Boolean).pop() || link; } catch { title = link; }
    }
    if (title && link) {
      items.push({ title, link, description, pubDate, category, tags, source: 'rss' });
    }
  }

  // 處理 Atom <entry>
  if (items.length === 0) {
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    for (const raw of entries.slice(0, maxItems)) {
      const title = extractTag(raw, 'title');
      const linkMatch = raw.match(/<link[^>]*href="([^"]+)"/);
      const link = linkMatch ? linkMatch[1] : extractTag(raw, 'link');
      const summary = stripHtml(extractTag(raw, 'summary') || extractTag(raw, 'content'));
      const pubDate = extractTag(raw, 'published') || extractTag(raw, 'updated');
      if (title && link) {
        items.push({ title, link, description: summary, pubDate, category, tags, source: 'rss' });
      }
    }
  }

  return items;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  let content = match[1].trim();
  // Strip CDATA wrapper
  content = content.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
  return content;
}

function stripHtml(html) {
  return html
    .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim().slice(0, 300);
}

function slugify(text) {
  const clean = text.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
  // URL-safe: only latin chars, digits, hyphens
  const slug = clean
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return slug || 'untitled';
}

// --- 去重機制 ---

function loadCache() {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
  }
  return { processedUrls: {}, lastRun: null };
}

function saveCache(cache) {
  cache.lastRun = new Date().toISOString();
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// --- Markdown 產生 ---

function generateMarkdown(item) {
  const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const frontmatter = `---
title: "${item.title.replace(/"/g, '\\"')}"
description: "${item.description.slice(0, 150).replace(/"/g, '\\"')}"
date: ${date}
category: "${item.category}"
tags: [${item.tags.map(t => `"${t}"`).join(', ')}]
source: rss
sourceUrl: "${item.link}"
---

`;

  const body = `> 原文：[${item.title}](${item.link})

${item.description ? `${item.description}\n\n` : ''}

---

*此文章由 RSS 自動聚合，完整內容請點閱原文。*
`;

  return frontmatter + body;
}

function generateFilename(item) {
  const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  let slug = slugify(item.title);
  // Fallback to URL path for non-latin titles
  if (slug === 'untitled' && item.link) {
    try {
      const urlPath = new URL(item.link).pathname.split('/').filter(Boolean).pop() || '';
      slug = urlPath.replace(/[^\w-]/g, '-').slice(0, 40) || 'article';
    } catch {
      slug = 'article';
    }
  }
  // Ensure slug has at least one letter
  if (!/[a-z]/i.test(slug)) {
    slug = `article-${slug || Date.now().toString(36)}`;
  }
  // Clean trailing/leading hyphens
  slug = slug.replace(/^-+|-+$/g, '') || 'article';
  return `${date}-${slug}.md`;
}

// --- 主流程 ---

async function main() {
  console.log('🔄 RSS 聚合開始...');

  const feeds = JSON.parse(readFileSync(FEEDS_FILE, 'utf-8'));
  const cache = loadCache();
  const processed = cache.processedUrls;

  if (!existsSync(POSTS_DIR)) {
    mkdirSync(POSTS_DIR, { recursive: true });
  }

  let newCount = 0;
  let skipCount = 0;

  for (const feed of feeds) {
    console.log(`📡 抓取: ${feed.url}`);
    const items = await fetchFeed(feed);
    console.log(`   取得 ${items.length} 筆`);

    for (const item of items) {
      if (processed[item.link]) {
        skipCount++;
        continue;
      }

      const filename = generateFilename(item);
      const filepath = join(POSTS_DIR, filename);
      writeFileSync(filepath, generateMarkdown(item));
      processed[item.link] = { title: item.title, date: new Date().toISOString() };
      newCount++;
      console.log(`   ✅ ${filename}`);
    }
  }

  saveCache(cache);
  console.log(`\n 完成: ${newCount} 篇新文章, ${skipCount} 篇已存在`);
}

main().catch(err => {
  console.error('❌ RSS 聚合失敗:', err);
  process.exit(1);
});

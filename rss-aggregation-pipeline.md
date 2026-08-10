---
type: note
status: seedling
created: 2026-07-18
updated: 2026-07-18
---

# RSS aggregation pipeline — technical details

## Overview
Zero-dependency RSS aggregation pipeline. Runs daily via GitHub Actions, fetches from multiple sources, deduplicates, generates Markdown files for Astro content collection.

## Architecture
```
GitHub Actions (daily UTC 02:00)
  → scripts/rss-aggregate.mjs
    → Read rss-feeds.json
    → For each feed:
        → fetch(url)
        → parse XML (built-in regex parser, no lib)
        → strip CDATA
        → slugify title (CJK-aware regex)
        → dedup against .rss-cache.json
        → generate Markdown to src/content/posts/rss/{slug}.md
    → Update .rss-cache.json
    → git add + commit + push
  → Cloudflare Pages auto-detects push → rebuilds → deploys
```

## Key files (absolute paths for agent reference)
- **Script**: `04_Projects/個人網站/scripts/rss-aggregate.mjs`
- **Feed config**: `04_Projects/個人網站/scripts/rss-feeds.json`
- **Dedup cache**: `04_Projects/個人網站/scripts/.rss-cache.json`
- **Workflow**: `04_Projects/個人網站/.github/workflows/rss-aggregate.yml`
- **Action flow**: `/Users/ethan/Documents/Obsidian Vault/04_Projects/Personal-Website/RSS 聚合管線-行動流程.md`
- **Pitfalls**: [[04_Projects/知識處理/影片分析工作流/Worklog|踩坑索引]]

## Feed sources
- Hacker News (homepage)
- BBC中文
- 36Kr via RSSHub (`rsshub.app/36kr/newsflashes`)
- Reddit blocked (403); no replacement yet

## Markdown output format
```yaml
---
title: "Original Title"
description: "Excerpt/summary"
date: 2026-07-12
source: rss
sourceUrl: "https://original-article-url.com"
category: "auto-categorized"
tags:
  - rss
---
Content excerpt...
[Read more](sourceUrl)
```

## Technical details

### CDATA stripping
```javascript
function stripCDATA(text) {
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}
```

### CJK-aware slugify
```javascript
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
```

### Dedup mechanism
Script maintains a JSON cache at `scripts/.rss-cache.json` tracking processed article URLs. Before generating a new Markdown file, it checks if the article URL exists in cache. Cache is committed to repo after each run.

### Permissions for auto-commit
GitHub Actions workflow needs `contents: write` + `workflows: write` in `permissions:` block for git push to succeed. Without `workflows: write`, push fails with `refusing to allow an OAuth App to create or update workflow`.

### Note on dynamic routes
Astro content collection `post.id` includes subdirectory path. For RSS articles in `src/content/posts/rss/`, use `post.id.split('/').pop()` to extract clean slug. See [[04_Projects/知識處理/影片分析工作流/Worklog|踩坑索引]] for details.

## Health check
- Tested with 20 articles (HN 10 + BBC 10) — all generated correctly
- CDATA, CJK slug, and dedup confirmed working
- Daily schedule configured but actual cron execution depends on repo activity (GitHub free tier reduces inactive repo schedule frequency)

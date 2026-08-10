---
type: note
status: seedling
created: 2026-07-18
updated: 2026-07-18
---

# Personal website rebuild — complete summary

Astro 7 + Cloudflare Pages 重建專案（Ethan-Ethan-Ethan/personal-website）。Phase 1-6 全數完成，2026-07-12 上線。

## Architecture
- **Framework**: Astro 7 + Tailwind CSS v4 (暖色暗色系, `#11110f` base)
- **Content**: Content Collections with Zod schema (title, description, date, category, tags, source[manual/rss/gmail], sourceUrl, draft)
- **CMS**: Decap CMS (Git-based, browser editing → commit → auto-deploy)
- **Deployment**: Cloudflare Pages (git push → auto build + deploy)
- **Domain**: `ethanyang.dpdns.org` → `personal-website-bvk.pages.dev` (CNAME proxied)
- **Domain type**: DigitalPlat FreeDomain (.dpdns.org), renew every 150 days, nameservers camilo/sonia.ns.cloudflare.com

## Phases completed
1. Astro 7 init + Tailwind v4: `src/content.config.ts` (root), components (Topbar/PostCard/Footer), pages (index/articles/[slug])
2. Decap CMS: `public/admin/index.html` + `config.yml`, GitHub backend
3. RSS pipeline: `scripts/rss-aggregate.mjs` (pure Node.js) + `.github/workflows/rss-aggregate.yml` (daily UTC 02:00)
4. Gmail pipeline: Google Apps Script + Gemini API, auto-extract newsletters → Markdown via GitHub API
5. TradingView: iframe embed (solves async load conflict with Astro Islands), Lightweight Charts component
6. Cloudflare Pages: connected GitHub repo, build command `astro build`, output `dist/`

## Key decisions
- wrangler OAuth > API Token (broader permissions for DNS)
- Pure Node.js > rss-parser library (zero dependencies)
- iframe embed > direct script tag for TradingView (isolation)
- GitHub Actions + Apps Script > n8n (zero cost)

## Key files (mental map)
- `scripts/rss-aggregate.mjs` — RSS parser + cache + Markdown generator
- `scripts/rss-feeds.json` — feed source config (HN, BBC中文, 36Kr/RSSHub)
- `scripts/.rss-cache.json` — dedup cache
- `scripts/gmail-fetch.gs` — Google Apps Script for Gmail
- `.github/workflows/rss-aggregate.yml` — daily schedule
- `.github/workflows/deploy.yml` — push trigger
- `src/pages/articles/[slug].astro` — dynamic route, `post.id.split('/').pop()` for path-based slugs
- `src/pages/trading-view-embed.html` — isolated iframe for TradingView widget

## Known pitfalls
- `\w` in JS regex is ASCII-only; CJK needs explicit range `一-鿿`
- CDATA stripping required for RSS XML
- Reddit RSS returns 403 server-side; use RSSHub instead
- GitHub Actions `GITHUB_TOKEN` lacks `workflow` scope by default; add `permissions: { contents: write, workflows: write }`
- Astro `post.id` is full path relative to collection dir, not bare filename
- TradingView widget incompatible with Astro partial hydration; use iframe

## Health check
- All phases done except Cloudflare Access (`/protected/*`) and old Workers decommission
- Domain renewal check: 2026-11-12
- Full zero-cost infrastructure

---
type: note
status: seedling
created: 2026-07-18
updated: 2026-07-18
---

# GitHub Actions + Cloudflare Pages deployment flow

## Overview
個人網站使用 git push → auto deploy 流程。GitHub Actions 負責排程任務，Cloudflare Pages 負責自動部署。

## Deployment flow
```
git push (main)
  → Cloudflare Pages detects push
  → Runs build command: `astro build`
  → Output from `dist/`
  → Deploys to `personal-website-bvk.pages.dev`
  → Custom domain `ethanyang.dpdns.org` (CNAME proxied via Cloudflare)
```

## Github Actions workflows

### 1. `deploy.yml` (push trigger)
Trigger: `push` to `main` branch. Currently redundant with Cloudflare Pages' native GitHub integration (Pages auto-builds on push). Kept for future extensibility.

### 2. `rss-aggregate.yml` (schedule)
- **Schedule**: daily UTC 02:00
- **Job steps**: checkout → run `node scripts/rss-aggregate.mjs` → git commit + push
- **Permissions**: `contents: write`, `workflows: write` (needed for auto-commit)
- **Key files**:
  - `scripts/rss-aggregate.mjs` — main script
  - `scripts/rss-feeds.json` — feed configuration
  - `scripts/.rss-cache.json` — dedup cache (committed to repo)

## Cloudflare Pages config
- **Project name**: `personal-website`
- **Build command**: `astro build`
- **Output directory**: `dist/`
- **Domain**: `ethanyang.dpdns.org` → `personal-website-bvk.pages.dev`
- **Auth**: wrangler OAuth (`wrangler login`) — NOT API Token

## DNS setup
- **Nameservers**: `camilo.ns.cloudflare.com`, `sonia.ns.cloudflare.com`
- **DNS record**: CNAME `ethanyang.dpdns.org` → `personal-website-bvk.pages.dev` (proxied: true)
- **SSL**: Full (strict)
- **Domain source**: DigitalPlat FreeDomain (renew every ~150 days, next check: 2026-11-12)

## Pitfalls
- Cloudflare API Token needs both Workers AND Zone DNS Edit scope for full control
- wrangler OAuth is preferred over API Token (broader permissions)
- GitHub Actions default `GITHUB_TOKEN` lacks `workflow` scope → add `permissions: { workflows: write }`
- After domain migration from Workers to Pages, update the CNAME target

## Verification checklist
```bash
curl -I https://ethanyang.dpdns.org/           # expect 200
curl -I https://ethanyang.dpdns.org/articles/   # expect 200
curl -I https://personal-website-bvk.pages.dev/ # expect 200
```

## Related Vault files
- `/Users/ethan/Documents/Obsidian Vault/04_Projects/Personal-Website/` (full project docs)
- `網站部署 SOP.md` — old Workers-based deployment SOP (superseded, kept for reference)

---
type: reference
project: personal-website
created: 2026-07-12
updated: 2026-07-18
tags:
  - project/personal-website
  - workflow/rss
status: seedling
verification_status: partial
---

# RSS 聚合管線 — 行動流程

## 目標
每日自動從多個 RSS 源擷取文章，去重後產生 Markdown 檔，存入 repo 供 Astro 網站渲染。

## 前置條件
- GitHub repo：`Ethan-Ethan-Ethan/personal-website`
- Node.js 22+（GitHub Actions runner 內建）
- RSS 源配置檔：`scripts/rss-feeds.json`
- Cloudflare Pages 已連接 GitHub repo
- GitHub Actions workflow 有 `contents: write` + `workflows: write` 權限

## 架構

```
GitHub Actions (每日 UTC 02:00)
  ├── Checkout repo
  ├── Run scripts/rss-aggregate.mjs
  │     ├── 1. 讀取 rss-feeds.json（RSS 源配置）
  │     ├── 2. 依序 fetch 每個 RSS feed
  │     ├── 3. 解析 XML（內建 regex parser，無外部套件）
  │     │     ├── CDATA stripping
  │     │     └── CJK-aware slugify
  │     ├── 4. 去重比對（scripts/.rss-cache.json）
  │     ├── 5. 產生 Markdown（src/content/posts/rss/{slug}.md）
  │     └── 6. 更新去重快取
  ├── git commit + push（需 workflow scope 權限）
  └── Cloudflare Pages 自動偵測 push → 重新部署
```

## 詳細步驟

### 1. 新增 RSS 源
編輯 `scripts/rss-feeds.json`：

```json
{
  "feeds": [
    {
      "name": "來源名稱（中文可）",
      "url": "https://rss-source.com/feed",
      "category": "分類（如 tech, news）"
    }
  ]
}
```

注意：Reddit RSS 已被封鎖（403），請優先使用 RSSHub 等替代源。

### 2. 本機測試腳本
```bash
cd 04_Projects/個人網站
node scripts/rss-aggregate.mjs
```

預期結果：
- 無錯誤訊息
- `src/content/posts/rss/` 產生新 Markdown 檔
- `scripts/.rss-cache.json` 已更新（含新 URL）

### 3. 驗證 GitHub Actions
```bash
git add .
git commit -m "test: rss aggregate"
git push
```
到 GitHub → Actions → `RSS Aggregate` workflow 確認執行成功。

若 auto-commit 失敗（`refusing to allow an OAuth App to create or update workflow`）：
- 檢查 `.github/workflows/rss-aggregate.yml` 的 `permissions:` 區塊
- 需包含 `workflows: write`

```yaml
jobs:
  aggregate:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      workflows: write
```

### 4. 確認網站更新
等待 Cloudflare Pages 重新部署完成後，到 `https://ethanyang.dpdns.org` 確認新文章出現。

## 關鍵檔案路徑

| 檔案 | 用途 | 位置 |
|------|------|------|
| `rss-aggregate.mjs` | 主腳本（純 Node.js） | `scripts/rss-aggregate.mjs` |
| Feed 配置 | RSS 源設定 | `scripts/rss-feeds.json` |
| 去重快取 | 已處理 URL 紀錄 | `scripts/.rss-cache.json` |
| Workflow 排程 | GitHub Actions 排程 | `.github/workflows/rss-aggregate.yml` |
| 文章產出 | 自動產生的 Markdown | `src/content/posts/rss/` |
| 動態路由 | 文章詳情頁面 | `src/pages/articles/[slug].astro` |

完整專案路徑：`04_Projects/個人網站/`

## 技術細節

### CDATA 處理
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

### 去重機制
腳本維護 `scripts/.rss-cache.json`，記錄已處理的文章 URL。每次執行先載入快取，新文章比對 URL 後才寫入。快取隨 repo 一併 commit。

### 動態路由 slug 萃取
Astro Content Collections 的 `post.id` 是相對完整路徑。RSS 文章在 `posts/rss/` 子目錄，需用 `.split('/').pop()` 取最後一段：

```javascript
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.id.split('/').pop() },
    props: { post },
  }));
}
```

## 驗證清單

- [ ] RSS 腳本本機執行無錯誤
- [ ] 產生的 Markdown 檔具備完整 frontmatter（title, date, source, sourceUrl, category, tags）
- [ ] 中文標題文章產生正確 slug（非空字串、無 `rss/` 前綴）
- [ ] Astro 網站正確渲染 RSS 文章（無 404）
- [ ] GitHub Actions 排程按時觸發（每日 UTC 02:00）
- [ ] 去重機制有效（重複執行不會產生重複文章）
- [ ] Cloudflare Pages 自動部署成功
- [ ] 腳本不輸出全文（只存摘要 + 原文連結，版權合規）

## 注意事項
- Reddit RSS 已被封鎖（403），改用 RSSHub 替代源
- CDATA 標籤需在解析前剝離
- 中文標題 slugify 需包含 CJK range（`一-鿿`）
- GitHub Actions GITHUB_TOKEN 預設無 workflow scope，需手動設定
- 只存摘要 + 原文連結，不全文重製（版權考量）
- 單一來源失敗不影響其他來源（腳本內建 try-catch）

## 相關
- [[網站重建計畫 2026]]
- [[04_Projects/知識處理/影片分析工作流/Worklog|踩坑索引]]
- [[Worklog]]

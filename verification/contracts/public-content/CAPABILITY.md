# Public Content Sync Capability Contract

- **可觀察行為**：從明確白名單的 Obsidian notes 產生 deterministic、可公開、無來源路徑與敏感資料的 JSON projection；check 模式可在 CI fail-closed。
- **已知弱行為**：不信任正文自動摘要；只接受人工審核的 `site_*` frontmatter。影像、履歷附件與 runtime 細節永不自動公開。
- **可演化檔案**：`scripts/lib/public-content.mjs`、`scripts/lib/sync-public-content.mjs` 與 `scripts/site-content.mjs`；rubric 與 golden fixtures 凍結後不得為了通過而放寬。

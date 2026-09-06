# Site System Generator Capability Contract

- **可觀察行為**：驗證 `config/site-system.yaml` 的分類、依賴、layer 與 command contract，並 deterministic 產生帶 source SHA 水印的 TypeScript registry。
- **已知弱行為**：不判斷視覺美感、不自動發明 element／feature／command；未知鍵、循環依賴、非法 command 或 layer 必須 fail-closed。
- **可演化檔案**：`verification/contracts/site-system/docs/prompt.seed.md`；YAML schema、rubric、golden fixtures 凍結後不得為提高分數而放寬。

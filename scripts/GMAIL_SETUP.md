# Gmail 擷取管線設定指南

## 步驟

### 1. 建立 Google Apps Script 專案

1. 前往 https://script.google.com/
2. 點擊「新增專案」
3. 將 `scripts/gmail-extract.gs` 的內容貼到 `Code.gs`
4. 專案命名：`Gmail Article Extractor`

### 2. 取得 API Keys

#### Gemini API Key
1. 前往 https://aistudio.google.com/apikey
2. 建立 API key
3. 複製到 `CONFIG.geminiApiKey`

#### GitHub Token
1. 前往 https://github.com/settings/tokens
2. 產生新 token（classic）
3. 勾選 `repo` 權限
4. 複製到 `CONFIG.githubToken`

### 3. 設定 Gmail 權限

第一次執行時會要求授權：
- 讀取 Gmail 郵件
- 呼叫外部 API（Gemini）
- 存取 GitHub API

### 4. 設定排程

1. 在 Apps Script 編輯器左側點擊「排程器」（時鐘圖示）
2. 新增排程：
   - 函數：`extractGmailArticles`
   - 部署：「Head」
   - 事件來源：「時間驅動」
   - 類型：「天計時器」→ 選擇時間（建議上午 10:00-11:00）

### 5. 測試

1. 在編輯器選擇 `testExtract` 函數
2. 點擊執行
3. 檢查 GitHub repo 的 `src/content/posts/gmail/` 目錄

## Gmail 搜尋條件

預設搜尋：`label:Newsletters OR label:Newsletter OR from:newsletter`

可自訂：
- `label:重要` — 只擷取標記為重要的郵件
- `from:example@newsletter.com` — 指定發件者
- `subject:每週` — 標題包含特定文字
- `is:unread` — 只擷取未讀郵件

## 注意事項

- 每次執行最多處理 20 封郵件
- 已處理的郵件 ID 會儲存在 PropertiesService，不會重複處理
- Gemini API 有免費額度（每分鐘 15 次請求）
- GitHub API rate limit：每小時 5000 次（ authenticated）

## 疑難排解

### 授權錯誤
重新執行 `testExtract`，按照提示授權

### Gemini API 配額用盡
等待配額重置或升級方案

### GitHub push 失敗
檢查 token 權限是否包含 `repo`

### 郵件未擷取
檢查 Gmail 搜尋條件是否正確，或手動測試 `testExtract`

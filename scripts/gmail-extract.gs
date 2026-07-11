/**
 * Gmail 文章擷取腳本（Google Apps Script）
 * 排程執行 → 讀取 Gmail → Gemini 分析 → 產生 Markdown → 推送到 GitHub repo
 */

// === 設定 ===
const CONFIG = {
  // Gmail 搜尋條件（可自訂）
  gmailQuery: 'label:Newsletters OR label:Newsletter OR from:newsletter',

  // Gemini API 設定
  geminiApiKey: 'YOUR_GEMINI_API_KEY',  // 替換為實際 key
  geminiModel: 'gemini-2.0-flash',

  // GitHub 設定
  githubRepo: 'Ethan-Ethan-Ethan/personal-website',
  githubBranch: 'main',
  githubToken: 'YOUR_GITHUB_TOKEN',  // 替換為 actual token with repo scope

  // 每次處理上限
  maxEmails: 20,

  // 輸出路徑（相對於 repo 根目錄）
  outputDir: 'src/content/posts/gmail',
};

// === 主函數（排程觸發） ===
function extractGmailArticles() {
  console.log('🔄 Gmail 取開始...');

  // 1. 讀取已處理的郵件 ID（從 PropertiesService）
  const properties = PropertiesService.getScriptProperties();
  const processedIds = JSON.parse(properties.getProperty('processedEmails') || '{}');

  // 2. 搜尋 Gmail
  const threads = GmailApp.search(CONFIG.gmailQuery, 0, CONFIG.maxEmails);
  let newCount = 0;
  let skipCount = 0;

  for (const thread of threads) {
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1];
    const messageId = latestMessage.getId();

    // 跳過已處理的郵件
    if (processedIds[messageId]) {
      skipCount++;
      continue;
    }

    try {
      // 3. 提取郵件內容
      const subject = latestMessage.getSubject();
      const body = latestMessage.getPlainBody();
      const from = latestMessage.getFrom();
      const date = latestMessage.getDate();

      // 4. 用 Gemini 分析內容
      const analysis = analyzeWithGemini(subject, body);

      if (!analysis || !analysis.title) {
        console.warn(`⚠️  無法分析: ${subject}`);
        continue;
      }

      // 5. 產生 Markdown
      const markdown = generateMarkdown(analysis, date, from);
      const filename = generateFilename(analysis.title, date);

      // 6. 推送到 GitHub
      pushToGitHub(filename, markdown);

      // 7. 記錄已處理
      processedIds[messageId] = {
        title: analysis.title,
        date: new Date().toISOString(),
      };

      newCount++;
      console.log(`✅ ${filename}`);

      // 避免 API 限流
      Utilities.sleep(500);
    } catch (err) {
      console.error(`❌ 處理失敗: ${subject} - ${err.message}`);
    }
  }

  // 8. 儲存已處理記錄
  properties.setProperty('processedEmails', JSON.stringify(processedIds));

  console.log(`完成: ${newCount} 篇新文章, ${skipCount} 篇已存在`);
}

// === Gemini API 分析 ===
function analyzeWithGemini(subject, body) {
  const prompt = `請分析以下電子報內容，提取關鍵資訊。

主題：${subject}

內容（前 2000 字）：
${body.slice(0, 2000)}

請以 JSON 格式回覆（不要其他文字）：
{
  "title": "文章標題（繁體中文，簡潔有力）",
  "description": "摘要（50-100 字）",
  "category": "分類（科技/商業/設計/生活/其他）",
  "tags": ["標籤1", "標籤2"],
  "url": "原文連結（如果有）",
  "keyPoints": ["重點1", "重點2", "重點3"]
}

如果內容不適合整理成文章，回覆 {"title": null}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiApiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500,
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());

  if (!data.candidates || !data.candidates[0]) {
    return null;
  }

  const text = data.candidates[0].content.parts[0].text;

  // 解析 JSON（可能包含 markdown code block）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('JSON 解析失敗:', err.message);
    return null;
  }
}

// === Markdown 產生 ===
function generateMarkdown(analysis, date, from) {
  const dateStr = Utilities.formatDate(date, 'Asia/Taipei', 'yyyy-MM-dd');

  let frontmatter = `---
title: "${analysis.title.replace(/"/g, '\\"')}"
description: "${(analysis.description || '').slice(0, 150).replace(/"/g, '\\"')}"
date: ${dateStr}
category: "${analysis.category || '其他'}"
tags: [${(analysis.tags || []).map(t => `"${t}"`).join(', ')}]
source: gmail
`;

  if (analysis.url) {
    frontmatter += `sourceUrl: "${analysis.url}"\n`;
  }

  frontmatter += `---

`;

  let body = `> 來源：${from}\n\n`;

  if (analysis.url) {
    body += `> 原文：[${analysis.title}](${analysis.url})\n\n`;
  }

  if (analysis.description) {
    body += `## 摘要\n\n${analysis.description}\n\n`;
  }

  if (analysis.keyPoints && analysis.keyPoints.length > 0) {
    body += `## 重點\n\n`;
    analysis.keyPoints.forEach(point => {
      body += `- ${point}\n`;
    });
    body += `\n`;
  }

  body += `\n---\n\n*此文章由 Gmail 自動擷取，完整內容請點閱原文。*\n`;

  return frontmatter + body;
}

// === 檔名產生 ===
function generateFilename(title, date) {
  const dateStr = Utilities.formatDate(date, 'Asia/Taipei', 'yyyy-MM-dd');
  const slug = title
    .replace(/[^\w一-鿿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .toLowerCase();

  return `${dateStr}-${slug || 'untitled'}.md`;
}

// === 推送到 GitHub ===
function pushToGitHub(filename, content) {
  const filePath = `${CONFIG.outputDir}/${filename}`;
  const url = `https://api.github.com/repos/${CONFIG.githubRepo}/contents/${filePath}`;

  // 檢查檔案是否已存在
  let sha = null;
  try {
    const checkResponse = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `token ${CONFIG.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      muteHttpExceptions: true,
    });

    if (checkResponse.getResponseCode() === 200) {
      const existing = JSON.parse(checkResponse.getContentText());
      sha = existing.sha;
    }
  } catch (err) {
    // 檔案不存在，繼續建立
  }

  // 建立/更新檔案
  const payload = {
    message: `📬 Gmail 擷取: ${filename}`,
    content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
    branch: CONFIG.githubBranch,
  };

  if (sha) {
    payload.sha = sha;
  }

  const options = {
    method: 'put',
    headers: {
      'Authorization': `token ${CONFIG.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() !== 201 && response.getResponseCode() !== 200) {
    throw new Error(`GitHub API 失敗: ${response.getResponseCode()} - ${response.getContentText()}`);
  }
}

// === 手動測試函數 ===
function testExtract() {
  extractGmailArticles();
}

function testGemini() {
  const sample = analyzeWithGemini('Test Subject', 'This is a test email body with some content.');
  console.log(JSON.stringify(sample, null, 2));
}

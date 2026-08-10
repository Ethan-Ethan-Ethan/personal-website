---
title: "用神器Claude Code！打造贴身AI秘书团【小白教程】"
source: "https://www.youtube.com/watch?v=J83BFDHeut0"
author:
  - "[[秋芝2046]]"
published: 2025-08-20
created: 2026-06-15
description: "神器Claude Code超绝用法！给你的生活配AI秘书团！全程保姆级佳教学，小白也能轻松上手！感谢朋友们点赞+订阅～文档链接🔗：https://ccnk05wgo092.feishu.cn/wiki/BxLTwlkvkiQhJkkJ7vgc95aZnMe"
tags:
  - domain/meta
type: reference
status: active
updated: 2026-07-18
verification_status: partial
---
![](https://www.youtube.com/watch?v=J83BFDHeut0)

神器Claude Code超绝用法！  
给你的生活配AI秘书团！  
全程保姆级佳教学，小白也能轻松上手！  
感谢朋友们点赞+订阅～  
  
文档链接🔗：  
https://ccnk05wgo092.feishu.cn/wiki/BxLTwlkvkiQhJkkJ7vgc95aZnMe

根據影片[【用神器Claude Code！打造貼身AI秘書團】](https://www.youtube.com/watch?v=J83BFDHeut0)的內容，為您整理出該教學的**大綱**以及打造 AI 秘書團的**核心工作流程**：

---

## 影片大綱

1. **核心概念介紹 [01:13在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=73)**
    
    - 認識 **Claude Code (CC)**：Anthropic 推出的終端機 AI Agent（智能代理）。
        
    - **傳統網頁 AI vs. Claude Code [02:07在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=127)**：傳統網頁 AI 像無手無腳的社區諮詢機；而 Claude Code 則是擁有你家鑰匙、能深度讀取個人資料、無限擴充 MCP 外掛工具，並能引領團隊的「貼身秘書」。
        
    - **Sub-agents（子代理）功能 [03:11在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=191)**：由一個大秘書根據需求生成並調派不同特長的小秘書（如新聞、穿搭、體重管理等代理）。
        
2. **環境部署與設定 [03:34在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=214)**
    
    - **工具準備**：使用代碼編輯器（如 Cursor、VS Code 等）開啟空白資料夾。
        
    - **自動安裝 [04:11在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=251)**：在 Cursor 的 Agent 模式下，直接發送 Claude Code 官方文檔，讓 AI 自動下載並配置。
        
    - **更換國產大腦 (API Key) [04:37在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=277)**：若無法使用原生的 Claude 模型，可替換為其他 API（如 GLM-4.5 或 Kimi 等）。
        
    - **基本指令與常用參數 [05:48在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=348)**：利用 `/help` 查看指令，以及使用 `--dangerously-skip-permissions` 參數跳過每步工具調用的權限確認 [07:15在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=435)。
        
3. **秘書團團隊設計與完善 [07:38在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=458)**
    
    - **建立構想文件 [07:46在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=466)**：創建 `構想.md` 文件，規劃各個秘書的角色（新聞秋、穿搭秋、教練秋、日報秋、反思秋）。
        
    - **讓 AI 完善想法 [09:02在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=542)**：框選構想文件，讓 Claude Code 自動生成項目結構（如 `README.md`）和個人信息模板 [10:00在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=600)。
        
4. **孵化與實戰運行 [10:28在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=628)**
    
    - **配置 MCP 工具外掛**：前往 Smithy 工具超市挑選所需外掛（如圖像生成、飛書、天氣、搜尋外掛等），並將代碼寫入終端機。
        
    - **親手創建 Agent（注入靈魂）[13:48在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=828)**：使用指令 `agent create` 逐步將構想落實為具體的子代理。
        
    - **全自動化運行展示 [16:00在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=960)**：初始化 `claude.md` 徽章制度文件。一句「早上好」即可觸發一連串自動化秘書流（推送新聞 -> 穿搭建議 -> 日報規劃 -> 體重管理）。
        

---

## AI 秘書團打造工作流程

要跟著影片實操，核心的工作流程可以分為以下 **4 大步驟**：

```
[環境部署] ──> [團隊設計] ──> [外掛配置 (MCP)] ──> [孵化與運行]
```

### 1. 環境部署

- **步驟 A**：下載並打開代碼編輯器（例如 Cursor），建立一個全新的空白工作資料夾 [04:01在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=241)。
    
- **步驟 B**：在 Cursor 的 Agent 聊天對話框中，貼上 Claude Code 官方文檔並輸入：「幫我安裝一個 Claude Code」讓 AI 自動幫你裝好環境 [04:16在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=256)。
    
- **步驟 C**：獲取第三方大模型（如 GLM-4.5 等）的 API Key，在終端機輸入替換命令，完成大腦切換 [04:57在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=297)。
    
- **步驟 D**：在終端機輸入啟動命令（建議加上跳過確認的參數）：
    
    Bash
    
    ```
    claude --dangerously-skip-permissions
    ```
    

### 2. 團隊角色設計

- **步驟 A**：在資料夾中新建一個 `構想.md` 的 Markdown 文件 [07:46在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=466)。
    
- **步驟 B**：在文件中用中文寫下你想讓哪些秘書幫你幹活。例如：
    
    - _新聞秘書_：每天爬取最新的 AI 新聞並總結。
        
    - _穿搭秘書_：根據天氣與行程給出穿搭建議。
        
    - _健康教練_：記錄體重、督促運動與飲食。
        
- **步驟 C**：框選這段文字，對 Claude Code 說：「我想設置幾個 subagents，這是我發的想法，你能幫我完善並列出需要哪些文件夾和工具嗎？」[09:06在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=546)
    
- **步驟 D**：填寫 AI 為你生成的個人背景資訊文檔（如年齡、受身目標、喜好），讓秘書團徹底了解你 [10:04在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=604)。
    

### 3. 配置外掛工具有限公司 (MCP 配置)

- **步驟 A**：到工具超市（如 Smithy）挑選你需要的外掛（如：吉夢/即夢 AI 圖片生成、Firecrawl 網頁搜尋、飛書對接等）[10:32在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=632)。
    
- **步驟 B**：根據外掛提示獲取對應的 Token 或 Session ID [11:10在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=670)。
    
- **步驟 C**：在終端機（先退出 Claude Code 對話）中，複製並執行外掛的安裝指令 [11:33在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=693)。
    
- **步驟 D**：輸入 `claude mcp list` 檢查所有外掛是否皆顯示為 `connected`（已連接）[13:42在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=822)。
    

### 4. 孵化 Agent 與自動化運行

- **步驟 A**：重新進入 `claude` 對話，輸入 `agent create` 創立子代理 [13:56在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=836)。
    
- **步驟 B**：根據提示選擇「在此項目中使用」，並把你在第 2 步中設計的秘書提示詞發給它，挑選該秘書可以動用的 MCP 工具與字體顏色 [14:12在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=852)。
    
- **步驟 C**：重複此步驟，直到把新聞、穿搭、教練等秘書全部孵化完成 [15:49在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=949)。
    
- **步驟 D**：在對話中輸入 `/init` 進行項目初始化，這會生成一個 `claude.md`（制度徽章文件），規範所有小秘書的整體運作原則（例如必須說中文）[16:00在新視窗中開啟](http://www.youtube.com/watch?v=J83BFDHeut0&t=960)。
    

完成後，你只需要在終端機輸入一句「早安」，整個秘書團隊就會自動開始輪流上陣為你服務！

根據影片內容，使用 Claude Code 打造的 AI 秘書團，其**核心使用場景**是將日常繁瑣、零碎的資訊整理與生活規劃，交由多個各司其職的 AI 代理（Sub-agents）來進行**無縫的自動化協作**。

主要的使用場景與具體應用如下：

### 1. 晨間個人助理（全自動工作流觸發）

- **場景**：每天早上起床，只需對終端機說一句「早上好」或「雷猴啊」[00:16:47]。
    
- **應用**：大秘書會立刻喚醒**新聞秘書**，主動爬取全網最新的 AI 行聞並生成簡報，同時自動發送到你的飛書（Lark）或通訊軟體中。
    

### 2. 智慧穿搭與日程管理

- **場景**：出門前的行程準備。
    
- **應用**：**穿搭秘書**會自動對接天氣 MCP 工具，詢問你白天的行程（例如：白天去公司開會、晚上參加正式晚宴），並根據你的個人外在形象，給出具體的服裝搭配建議，甚至利用 AI 繪圖工具直接生成穿搭參考照。
    

### 3. 工作目標細化與工作日報

- **場景**：梳理一天混亂的工作想法。
    
- **應用**：**日報秘書**會引導式詢問你今天的具體安排（如會議主題、關鍵決策點、期待達成的目標）[00:18:00]。AI 會將你粗糙的想法細化，列出會議注意事項、自檢標準、甚至是今日座右銘，並自動轉化為專業的工作日報發送到工作群組。
    

### 4. 貼身健康與體重管理

- **場景**：日常健康數據追蹤與飲食建議。
    
- **應用**：**健康教練**會催促你回報體重，並結合你過去的健康歷史（例如記得你之前脖子酸痛、眼睛腫等細節）[00:19:11]。在你回報體重和吃了什麼之後，它會即時提供緊急消腫方案、推薦外賣飲食、並給出社交場合的飲食與社交策略。
    

### 5. 晚間反思與復盤

- **場景**：一天工作結束後的總結。
    
- **應用**：**反思秘書**就像一位導師，會自動讀取你這一天存下來的所有工作文檔、日程記錄與零碎想法，引導你進行深度的反思與復盤，幫助你實現個人成長。
    

---

總結來說，這個工具最酷的使用場景在於「擺脫傳統 APP 的碎片化」**[00:20:17]。以前你需要分開打開備忘錄、體重記錄 APP、天氣預報和新聞軟體；現在透過 Claude Code 的子代理功能，你可以為自己**客製化一個完全聽命於你、且共享你所有個人背景資訊的 AI 秘書團，用極低的成本享受賽博時代的管家式服務。
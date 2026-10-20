---
title: 不使用 Claude 的三大理由：你需要的不是更強的模型，而是更好的 Harness
description: 問題多半不在模型誰比較聰明，而在 Harness、Skills 與工作流有沒有接好。模型是引擎，Harness 才是整台車。
date: 2026-10-18
category: 公開筆記
tags:
  - AI
  - Harness
  - Agent
source: manual
draft: false
pinned: true
---

# 不使用 Claude 的三大理由：你需要的不是更強的模型，而是更好的 Harness

### 1. Claude 沒有你想像中那麼聰明

網上看別人用 Claude 封神，自己上手卻像換了一個模型。

問題可能不在模型，而在你的 `AGENTS.md`、Skills 與它內建的 Harness 互相打架。

真正的問題不是誰更聰明，而是誰在跟誰搶方向盤。

- [如何解決 AGENTS.md 與 Skill 的衝突，讓不同模型通用？](/wip/agents-md-skill-conflict)
- [你需要的不是更多 Skill，而是更好的 Loop](/wip/better-loop-not-more-skills)

### 2. Claude 沒有解決幻覺

只要是大語言模型，幻覺就不可能靠換個模型徹底消失。

模型負責生成，Harness 負責約束、驗證與糾錯。Claude CLI 本身就有大量工具調用與流程控制機制，API 端也能搭配各種工具與指令。

**別把完整的工程包裝，當成模型突然開竅。**

我甚至懷疑，很多人比較的根本不是模型，而是整套 Harness 的差距。

### 3. Claude 不是開源模型，你的控制權也不完整

帳號說封就封，服務說停就停。模型再強，不能用就是零分。

至於不同地區是否存在能力差異，沒有足夠證據就不下定論。但把整套 Agent 系統押在單一閉源服務上，本身就是風險。

與其追著 Claude 跑，不如把自己的 Harness、Skills 和工作流建好。底層模型可以隨時換，真正的能力才不會跟著帳號一起消失。

- [幾個值得推薦的開源模型：自己建 Harness，也能打](/wip/oss-models-own-harness)

### 想薅 Claude 羊毛？不如換個用法

如果只是想借 Claude 的腦袋幫專案做分析，可以試試 Claude Desktop 搭配官方 Filesystem 整合，讓它讀取專案文件、提供建議，再交給其他模型實作。

這樣可以把分析與執行分開，也能減少既有 Agent 指令與工作流互相干擾的問題。但能否讀取特定目錄、是否需要額外授權，仍取決於工具設定；也不能保證不會遇到帳號限制。

**讓貴的模型負責思考，讓便宜的模型負責幹活。別拿超跑送外賣。**

- [讓所有 Agent 共用同一份專案知識：你只需要接線與知識圖譜](/wip/shared-knowledge-graph)
- [大語言模型從一開始到現在，還是在玩文字拼圖](/wip/llm-word-puzzle)
- [AI 功能再花俏，不如大道至簡](/wip/simple-over-fancy-ai)

最後一句：

**別再迷信模型排行榜。模型是引擎，Harness 才是整台車。引擎再貴，方向盤裝反了也只能原地燒胎。**

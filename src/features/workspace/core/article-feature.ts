/** 首頁書本側欄的精選文章卡（靜態；與 GmailPanel bake JSON 同模式）。 */

export type ArticleFeatureCard = {
  index: string;
  title: string;
  body: string;
};

export type ArticleFeature = {
  chip: string;
  kicker: string;
  title: string;
  date: string;
  href: string;
  featured: string;
  cards: ArticleFeatureCard[];
};

export const ARTICLE_FEATURE: ArticleFeature = {
  chip: "筆記 · 2026-10-18",
  kicker: "公開筆記",
  title: "你需要的不是更強的模型，而是更好的 Harness",
  date: "2026-10-18",
  href: "/articles/harness-not-claude",
  featured:
    "別再迷信模型排行榜。模型是引擎，Harness 才是整台車。引擎再貴，方向盤裝反了也只能原地燒胎。",
  cards: [
    {
      index: "01",
      title: "Claude 沒有你想像中那麼聰明",
      body: "網上看別人用 Claude 封神，自己上手卻像換了一個模型。問題多半不在模型，而在 AGENTS.md、Skills 與內建 Harness 互相搶方向盤。",
    },
    {
      index: "02",
      title: "Claude 沒有解決幻覺",
      body: "只要是大語言模型，幻覺就不可能靠換模型徹底消失。模型負責生成，Harness 負責約束、驗證與糾錯。別把完整的工程包裝，當成模型突然開竅。",
    },
    {
      index: "03",
      title: "Claude 不是開源模型",
      body: "帳號說封就封，服務說停就停。模型再強，不能用就是零分。把整套 Agent 押在單一閉源服務上，本身就是風險。底層模型可以換，Harness 才不會跟著帳號消失。",
    },
    {
      index: "04",
      title: "與其薅羊毛，不如換用法",
      body: "貴的模型負責思考，便宜的模型負責幹活。分析與執行分開，減少指令與工作流互相干擾。別拿超跑送外賣。",
    },
  ],
};

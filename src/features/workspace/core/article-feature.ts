/** 首頁書本側欄的精選文章卡（靜態；與 GmailPanel bake JSON 同模式）。 */

import { wipHref } from "./article-wip";

export type ArticleRelated = { title: string; href: string };

export type ArticleFeatureCard = {
  index: string;
  title: string;
  body: string;
  related?: ArticleRelated[];
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
  chip: "筆記 · 2026-10-21",
  kicker: "公開筆記",
  title: "RAG 是公司必備嗎？我看未必。",
  date: "2026-10-21",
  href: "/articles/rag-not-mandatory",
  featured:
    "把 RAG 當成唯一解法，就像以為會用螺絲起子，天下就沒有螺絲解決不了的問題。",
  cards: [
    {
      index: "01",
      title: "懂 RAG 是專業，判死刑是傲慢",
      body:
        "Agent 還在快速演進，RAG 有用但遠不到公司必備。面試把「不懂 RAG」直接打成不合格，是把單一工具當成信仰。",
    },
    {
      index: "02",
      title: "不用傳統 RAG，也能做知識檢索",
      body:
        "Ontology 搭配向量檢索與開源 EmbeddingGemma 2 值得評估。目標是找得更準、存得更少、維護得更輕，而不是盲目堆架構。",
      related: [
        { title: "減少 Agent 資料存放位置：Ontology ＆ EmbeddingGemma 2", href: wipHref("ontology-embedding-gemma-2") },
        { title: "站在巨人肩上：小企業不必砸錢買模型設備，也能兼顧隱私與安全", href: wipHref("sme-open-weights-privacy") },
      ],
    },
    {
      index: "03",
      title: "檢索與語意：兩個常見誤區",
      body:
        "檢索不等於精準——切分、索引與召回都會漏。語意相似也不等於答案正確，向量可能召回「像但錯」的段落。",
    },
    {
      index: "04",
      title: "成本、迭代，與沒有萬靈丹",
      body:
        "文件與索引要持續維護；換 Embedding 常要重估向量化。Ontology 與向量檢索同樣有建模與品質問題，別換一個信仰。",
      related: [
        { title: "讓所有 Agent 共用同一份專案知識：你只需要接線與知識圖譜", href: wipHref("shared-knowledge-graph") },
      ],
    },
  ],
};

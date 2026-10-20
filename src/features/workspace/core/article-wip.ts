/** 日記方括號題目：尚無正文，點進 /wip/{slug} 顯示建構中。契約見 verification/contracts/articles/CAPABILITY.md */

export type WipNote = {
  slug: string;
  title: string;
};

export const WIP_NOTES: WipNote[] = [
  { slug: "agents-md-skill-conflict", title: "如何解決 AGENTS.md 與 Skill 的衝突，讓不同模型通用？" },
  { slug: "better-loop-not-more-skills", title: "你需要的不是更多 Skill，而是更好的 Loop" },
  { slug: "oss-models-own-harness", title: "幾個值得推薦的開源模型：自己建 Harness，也能打" },
  { slug: "shared-knowledge-graph", title: "讓所有 Agent 共用同一份專案知識：你只需要接線與知識圖譜" },
  { slug: "llm-word-puzzle", title: "大語言模型從一開始到現在，還是在玩文字拼圖" },
  { slug: "simple-over-fancy-ai", title: "AI 功能再花俏，不如大道至簡" },
  { slug: "ontology-embedding-gemma-2", title: "減少 Agent 資料存放位置：Ontology ＆ EmbeddingGemma 2" },
  { slug: "sme-open-weights-privacy", title: "站在巨人肩上：小企業不必砸錢買模型設備，也能兼顧隱私與安全" },
];

export function wipHref(slug: string): string {
  return `/wip/${slug}`;
}

export function wipBySlug(slug: string): WipNote | undefined {
  return WIP_NOTES.find((n) => n.slug === slug);
}

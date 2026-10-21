/** 將 post 正文拆成湖面側欄可讀的段落卡（### 為小節；文首無標題段為 intro）。 */

export type ArticleLakeCard = {
  index: string;
  title: string;
  body: string;
  related?: { title: string; href: string }[];
};

const MD_LINK = /^-\s+\[([^\]]+)\]\(([^)]+)\)\s*$/;

function stripInlineMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
}

function splitBodyAndLinks(block: string): { body: string; related: { title: string; href: string }[] } {
  const related: { title: string; href: string }[] = [];
  const bodyLines: string[] = [];
  for (const line of block.split('\n')) {
    const m = line.match(MD_LINK);
    if (m) related.push({ title: m[1], href: m[2] });
    else bodyLines.push(line);
  }
  const body = stripInlineMarkdown(bodyLines.join('\n').replace(/\n{3,}/g, '\n\n').trim());
  return { body, related };
}

export function parseArticleLakeBody(markdown: string): { intro?: string; cards: ArticleLakeCard[] } {
  let text = markdown.replace(/^\s*#\s+.+?\n+/, '').trim();
  if (!text) return { cards: [] };

  const parts = text.split(/^###\s+/m);
  const preamble = parts[0]?.trim() ?? '';
  const sections = parts.slice(1);

  const intro = preamble ? stripInlineMarkdown(preamble) : undefined;

  if (sections.length === 0) {
    const { body, related } = splitBodyAndLinks(preamble || text);
    if (!body) return { intro, cards: [] };
    return {
      intro,
      cards: [{ index: '01', title: '正文', body, related: related.length ? related : undefined }],
    };
  }

  const cards = sections.map((section, i) => {
    const lines = section.trim().split('\n');
    const title = stripInlineMarkdown(lines[0]?.trim() ?? '段落');
    const { body, related } = splitBodyAndLinks(lines.slice(1).join('\n'));
    return {
      index: String(i + 1).padStart(2, '0'),
      title,
      body,
      related: related.length ? related : undefined,
    };
  });

  return { intro, cards };
}

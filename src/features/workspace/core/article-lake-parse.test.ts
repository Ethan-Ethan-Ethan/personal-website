import { describe, expect, it } from 'vitest';
import { parseArticleLakeBody } from './article-lake-parse';

describe('parseArticleLakeBody', () => {
  it('splits ### sections and extracts wip links', () => {
    const md = `# Title

Intro line.

### First point

Body one.

- [WIP A](/wip/a)

### Second

Body two.
`;
    const { intro, cards } = parseArticleLakeBody(md);
    expect(intro).toContain('Intro line');
    expect(cards).toHaveLength(2);
    expect(cards[0].title).toBe('First point');
    expect(cards[0].related?.[0].href).toBe('/wip/a');
  });
});

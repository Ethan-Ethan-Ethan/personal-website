import { useState, useMemo } from 'react';

const INK = '#f5f1e6';

/** 文章發表／瀏覽面板 — 整合於首頁 workspace（與 ForecastGlass / GmailPanel 同一玻璃擬態風格）。
 *  client-side 僅負責編輯＋預覽＋產生 Markdown 檔案內容；實際發布 = 複製內容 → 建立 src/content/posts/{slug}.md → git push。
 *  瀏覽現有文章：底部「瀏覽全部文章」連向 /articles/（Astro Content Collection 列表頁）。
 */
export default function ArticlePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fmTitle, setFmTitle] = useState('');
  const [fmDesc, setFmDesc] = useState('');
  const [fmCat, setFmCat] = useState('');
  const [fmTags, setFmTags] = useState('');
  const [fmSource, setFmSource] = useState('manual');
  const [fmDraft, setFmDraft] = useState('false');
  const [mdContent, setMdContent] = useState('# 標題範例\n\n這是第一段內容。\n\n## 副標題\n\n可以寫 Markdown 語法，例如列表：\n\n- 項目一\n- 項目二\n\n[連結範例](https://example.com)\n\n```javascript\nconsole.log(\'Hello World\');\n```\n\n---\n\n*請將上方內容替換為您的文章。*');

  const sourceLabel = { manual: '原創', gmail: 'Gmail' };
  const today = useMemo(() => new Date().toISOString(), []);
  const slug = useMemo(() => {
    const t = fmTitle || 'Untitled';
    return t.toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }, [fmTitle]);

  const tagsArr = useMemo(() => fmTags.split(',').map((t) => t.trim()).filter(Boolean), [fmTags]);

  const fileContent = useMemo(() => {
    const tagsYaml = tagsArr.length > 0 ? '\n  - ' + tagsArr.join('\n  - ') : '';
    return `---
title: "${fmTitle || 'Untitled'}"
description: "${fmDesc}"
date: ${today}
category: "${fmCat}"
tags:[${tagsYaml}\n  ]
source: ${fmSource}
draft: ${fmDraft}
---

${mdContent}`;
  }, [fmTitle, fmDesc, today, fmCat, tagsArr, fmSource, fmDraft, mdContent]);

  const htmlPreview = useMemo(() => mdToHtml(mdContent), [mdContent]);

  function mdToHtml(text: string): string {
    return text
      .replace(/^---[\s\S]*?---/m, '')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^---$/gm, '<hr>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>')
      .split(/\n\n+/)
      .map((para) => {
        const t = para.trim();
        if (!t) return '';
        if (t.startsWith('<') && t.endsWith('>')) return t;
        return '<p>' + t.replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  const GLASS = 'bg-white/10 border border-white/20 backdrop-blur-md rounded-xl shadow-card';
  const INPUT = 'w-full bg-black/20 border border-white/20 rounded-md p-2 text-sm text-white focus:border-green/60 focus:outline-none transition-colors';
  const LABEL = 'block text-[10px] text-white/60 uppercase tracking-wider mb-1 font-medium';

  const D = { chip: 100, header: 200, label: 300, input: 400, editor: 500, preview: 600, file: 700, btn: 800 } as const;

  return (
    <section
      className={`article-panel fc-node fc-dir-l ${open ? 'is-open' : ''}`}
      aria-label="文章發表"
      style={{
        position: 'absolute', top: '8%', left: '8%', right: '8%', zIndex: 5, pointerEvents: open ? 'auto' : 'none',
        maxHeight: '88vh', overflowY: 'auto',
        background: 'rgba(0,0,0,0.3)',
        fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <style>{`
        .article-wrap{display:flex;flex-direction:column;gap:16px;padding:24px;overflow-y:auto;min-height:60vh;}
        .article-header{margin-bottom:8px;}
        .article-kicker{display:block;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:2px;}
        .article-title{font-size:28px;font-weight:600;letter-spacing:-0.02em;color:#fff;margin:0;}
        .article-desc{font-size:14px;color:rgba(255,255,255,0.9);margin-top:6px;line-height:1.6;}
        .editor-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        @media (min-width: 901px){.editor-grid{grid-template-columns:1fr 1fr;}}
        .glass-card{background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.20);border-radius:16px;padding:18px 20px;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.35);display:flex;flex-direction:column;height:100%;}
        .panel-label{font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:10px;}
        textarea.markdown-edit{width:100%;height:420px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;color:#fff;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:14px;resize:none;line-height:1.7;outline:none;}
        textarea.markdown-edit:focus{border-color:rgba(136,181,107,0.6);}
        .preview-wrap{height:420px;overflow-y:auto;padding:14px;color:#fff;font-size:14px;line-height:1.8;}
        .preview-wrap h1,.preview-wrap h2,.preview-wrap h3{color:#fff;font-weight:600;margin-top:1.25em;margin-bottom:0.5em;}
        .preview-wrap p{margin-bottom:1em;color:rgba(255,255,255,0.95);}
        .preview-wrap a{color:#76a7bd;text-decoration:underline;}
        .preview-wrap a:hover{color:#88b56b;}
        .preview-wrap pre{background:#1b1b18;border:1px solid #37372f;border-radius:8px;padding:1em;overflow-x:auto;margin:1.5em 0;}
        .preview-wrap code{font-family:"JetBrains Mono",monospace;background:rgba(0,0,0,0.3);padding:0.15em 0.4em;border-radius:4px;font-size:0.875em;}
        .preview-wrap blockquote{border-left:3px solid #d4a34b;padding-left:1em;color:rgba(255,255,255,0.7);font-style:italic;margin:1.5em 0;}
        .file-output{margin-top:16px;border-top:1px solid rgba(255,255,255,0.15);padding-top:16px;}
        .file-output label{font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);display:block;margin-bottom:8px;}
        textarea.file-text{width:100%;height:150px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:12px;resize:none;outline:none;}
        .btn-row{display:flex;gap:10px;margin-top:12px;}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
        .btn-primary{background:#88b56b;color:#11110f;}
        .btn-primary:hover{background:#7aa35f;}
        .btn-ghost{background:rgba(255,255,255,0.10);color:#fff;border:1px solid rgba(255,255,255,0.2);}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.4);}
        .btn-close{position:absolute;top:12px;right:16px;z-index:6;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,0.10);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .btn-close:hover{background:rgba(255,255,255,0.2);}
        .browse-link{margin-top:16px;text-align:center;}
        .browse-link a{color:#76a7bd;text-decoration:none;font-size:13px;font-weight:600;}
        .browse-link a:hover{color:#88b56b;text-decoration:underline;}
        /* 動畫：fc-node 隱態、is-open 顯態、stagger */
        .fc-node{transform:translateY(14px);opacity:0;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1),opacity 0.6s cubic-bezier(0.16,1,0.3,1);}
        .fc-node.is-open{transform:none;opacity:1;}
        .fc-dir-l{transform:translateX(-26px);opacity:0;}
        .fc-dir-l.is-open{transform:none;opacity:1;}
        .fc-dir-r{transform:translateX(30px) scale(.985);opacity:0;}
        .fc-dir-r.is-open{transform:none;opacity:1;}
        .fc-dir-up{transform:translateY(14px);opacity:0;}
        .fc-dir-up.is-open{transform:none;opacity:1;}
        .fc-wipe-r{clip-path:inset(0 100% 0 0);transform:none;}
        .fc-wipe-r.is-open{clip-path:inset(0 0 0 0);}
        @media (prefers-reduced-motion: reduce){.fc-node,.fc-node.is-open{transition:none;transform:none;opacity:1;}}
      `}</style>
      <button type="button" className={`btn-close fc-node fc-dir-r ${open ? 'is-open' : ''}`} aria-label="關閉文章面板" onClick={onClose}>×</button>

      <div className="article-wrap">
        <div className="article-header fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.header}ms` : '0ms' }}>
          <span className="article-kicker fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.chip}ms` : '0ms' }}>發表新文章</span>
          <h1 className="article-title fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.header}ms` : '0ms' }}>工作室寫作區</h1>
          <p className="article-desc fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.header + 100}ms` : '0ms' }}>撰寫 Markdown，即時預覽，複製檔案內容後建立 `src/content/posts/${slug}.md` 並 push 即可發布。</p>
        </div>

        <div className="editor-grid">
          {/* 編輯器 */}
          <div className="glass-card fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.editor}ms` : '0ms' }}>
            <div className="panel-label">編輯器</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.label}ms` : '0ms' }}>
                <label className={LABEL}>標題 title</label>
                <input value={fmTitle} onChange={(e) => setFmTitle(e.target.value)} placeholder="文章標題" className={INPUT} />
              </div>
              <div className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.label + 50}ms` : '0ms' }}>
                <label className={LABEL}>來源 source</label>
                <select value={fmSource} onChange={(e) => setFmSource(e.target.value)} className={INPUT}>
                  <option value="manual">manual（原創）</option>
                  <option value="gmail">gmail（擷取）</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }} className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.label + 100}ms` : '0ms' }}>
              <label className={LABEL}>摘要 description</label>
              <input value={fmDesc} onChange={(e) => setFmDesc(e.target.value)} placeholder="一句話摘要" className={INPUT} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }} className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.label + 150}ms` : '0ms' }}>
              <div style={{ flex: 1 }} className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.input}ms` : '0ms' }}>
                <label className={LABEL}>分類 category</label>
                <input value={fmCat} onChange={(e) => setFmCat(e.target.value)} placeholder="例如：AI 工作流" className={INPUT} />
              </div>
              <div style={{ flex: 1 }} className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.input + 50}ms` : '0ms' }}>
                <label className={LABEL}>草稿 draft</label>
                <select value={fmDraft} onChange={(e) => setFmDraft(e.target.value)} className={INPUT}>
                  <option value="false">false（公開）</option>
                  <option value="true">true（草稿）</option>
                </select>
              </div>
            </div>
            <div className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.input + 100}ms` : '0ms' }}>
              <label className={LABEL}>標籤 tags（逗號分隔）</label>
              <input value={fmTags} onChange={(e) => setFmTags(e.target.value)} placeholder="例如：Astro, CI/CD, 自動化" className={INPUT} />
            </div>
            <label className={LABEL} className="fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.input + 150}ms` : '0ms' }}>Markdown 內容</label>
            <textarea className="markdown-edit fc-node fc-dir-up ${open ? 'is-open' : ''}" value={mdContent} onChange={(e) => setMdContent(e.target.value)} spellCheck={false} style={{ transitionDelay: open ? `${D.editor + 50}ms` : '0ms' }} />
          </div>

          {/* 預覽 */}
          <div className="glass-card fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.preview}ms` : '0ms' }}>
            <div className="panel-label">預覽</div>
            <div className="preview-wrap" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          </div>
        </div>

        <div className="file-output fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.file}ms` : '0ms' }}>
          <label>輸出檔案內容（複製後儲存至 `src/content/posts/${slug}.md`）</label>
          <textarea className="file-text" readOnly value={fileContent} spellCheck={false} />
          <div className="btn-row">
            <button type="button" className="btn btn-primary fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.btn}ms` : '0ms' }} onClick={() => {
              const ta = document.createElement('textarea');
              ta.value = fileContent;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              alert('已複製完整檔案內容');
            }}>
              複製檔案內容
            </button>
            <button type="button" className="btn btn-ghost fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.btn + 50}ms` : '0ms' }} onClick={() => {
              const ta = document.createElement('textarea');
              ta.value = mdContent;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              alert('已複製 Markdown 內容');
            }}>
              複製 Markdown
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
            步驟：1. 編輯內容 → 2. 複製檔案內容 → 3. 建立 `src/content/posts/${slug}.md` → 4. 貼上 → 5. git push 發布。
          </p>
        </div>

        <div className="browse-link fc-node fc-dir-up ${open ? 'is-open' : ''}" style={{ transitionDelay: open ? `${D.btn + 100}ms` : '0ms' }}>
          <a href="/articles/">瀏覽全部文章 →</a>
        </div>
      </div>
    </section>
  );
}

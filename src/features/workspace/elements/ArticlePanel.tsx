import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';
import type { ArticleCatalogEntry } from '../core/article-catalog';

const INK = '#ffffff';

const CARD: CSSProperties = {
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.20)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '14px 16px',
};

const FEATURED: CSSProperties = {
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '16px 18px',
};

const LINK: CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const D = { chip: 100, title: 200, feat: 280, card0: 360, cardStep: 70, link: 720 } as const;

type Props = {
  open: boolean;
  onClose: () => void;
  articles: ArticleCatalogEntry[];
};

export default function ArticlePanel({ open, onClose, articles }: Props) {
  const [activeHref, setActiveHref] = useState<string | null>(null);
  useEffect(() => {
    if (!open) setActiveHref(null);
  }, [open]);

  const active = useMemo(
    () => articles.find((a) => a.href === activeHref) ?? null,
    [articles, activeHref],
  );

  const on = open ? ' is-open' : '';
  const dl = (ms: number): { transitionDelay: string } => ({ transitionDelay: open ? `${ms}ms` : '0ms' });

  return (
    <section
      aria-label="公開筆記"
      className={`article-panel${on}`}
      style={{
        position: 'absolute',
        top: '12%',
        left: '9%',
        zIndex: 3,
        width: 'min(560px, 82vw)',
        maxHeight: '72vh',
        overflowY: 'auto',
        pointerEvents: open ? 'auto' : 'none',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
      <style>{`.article-panel{scrollbar-width:thin;overflow-x:hidden;}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}.fc-wipe-r{clip-path:inset(0 100% 0 0);transform:none;}@media (max-width: 900px){.article-panel{top:0 !important;left:0 !important;right:0 !important;bottom:110px !important;width:auto !important;max-height:none !important;overflow-y:auto !important;overflow-x:hidden !important;padding:96px 5% 130px;}.article-feature-card{background:rgba(0,0,0,0.62) !important;}.article-body-card{background:rgba(255,255,255,0.16) !important;border-color:rgba(255,255,255,0.28) !important;}}@media (prefers-reduced-motion: reduce){.article-panel .fc-node{transition:none;}}`}</style>

      <div data-testid="article-head" className={`fc-node fc-wipe-r${on}`} style={{ marginBottom: 12, ...dl(D.chip) }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: INK,
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 999,
            padding: '3px 10px',
          }}
        >
          Notes
        </span>
        <div style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
          公開筆記 · 置頂優先
        </div>
      </div>

      {!active ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {articles.map((entry, i) => (
            <li key={entry.href}>
              <button
                type="button"
                data-testid="article-list-item"
                className={`fc-node fc-dir-l article-feature-card${on}`}
                aria-label={`打開筆記｜${entry.title}`}
                onClick={() => setActiveHref(entry.href)}
                style={{
                  ...FEATURED,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: INK,
                  ...dl(D.title + i * 40),
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  {entry.pinned ? (
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: INK,
                        border: '1px solid rgba(255,255,255,0.35)',
                        borderRadius: 999,
                        padding: '1px 8px',
                      }}
                    >
                      置頂
                    </span>
                  ) : null}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{entry.date}</span>
                </div>
                <span data-testid="article-title" style={{ display: 'block', fontSize: 17, lineHeight: '26px', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {entry.title}
                </span>
                {entry.summary ? (
                  <span style={{ display: 'block', marginTop: 8, fontSize: 13, lineHeight: '20px', color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>
                    {entry.summary}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <h2
            data-testid="article-title"
            className={`fc-node fc-dir-l${on}`}
            style={{
              margin: '0 0 12px',
              fontSize: 20,
              lineHeight: '28px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: INK,
              ...dl(D.title),
            }}
          >
            {active.title}
          </h2>

          {active.summary ? (
            <article
              data-testid="article-featured"
              className={`fc-node fc-dir-l article-feature-card${on}`}
              aria-label={`摘要｜${active.summary}`}
              style={{ ...FEATURED, marginBottom: 12, ...dl(D.feat) }}
            >
              <p style={{ margin: 0, fontSize: 15, lineHeight: '24px', fontWeight: 500, color: INK, letterSpacing: '0.03em' }}>
                {active.summary}
              </p>
            </article>
          ) : null}

          <div className={`fc-node fc-dir-l${on}`} style={{ marginTop: 16, textAlign: 'center', ...dl(D.link) }}>
            <a href={active.href} style={LINK}>
              閱讀全文 →
            </a>
            {' · '}
            <button type="button" aria-label="返回筆記列表" onClick={() => setActiveHref(null)} style={LINK}>
              返回
            </button>
          </div>
        </>
      )}
    </section>
  );
}

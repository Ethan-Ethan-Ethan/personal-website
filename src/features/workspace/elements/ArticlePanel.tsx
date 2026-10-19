import type { CSSProperties } from 'react';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';
import { ARTICLE_FEATURE } from '../core/article-feature';

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

const D = { chip: 100, title: 200, feat: 280, card0: 360, cardStep: 70, link: 720 } as const;

export default function ArticlePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const on = open ? ' is-open' : '';
  const dl = (ms: number): { transitionDelay: string } => ({ transitionDelay: open ? `${ms}ms` : '0ms' });
  const doc = ARTICLE_FEATURE;

  return (
    <section
      aria-label="精選文章"
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
          {doc.chip}
        </span>
        <div style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
          {doc.kicker}
          {' · '}
          {doc.date}
        </div>
      </div>

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
        {doc.title}
      </h2>

      <article
        data-testid="article-featured"
        className={`fc-node fc-dir-l article-feature-card${on}`}
        aria-label={`精選｜${doc.featured}`}
        style={{ ...FEATURED, marginBottom: 12, ...dl(D.feat) }}
      >
        <p style={{ margin: 0, fontSize: 17, lineHeight: '26px', fontWeight: 600, color: INK, letterSpacing: '0.05em' }}>
          {doc.featured}
        </p>
      </article>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {doc.cards.map((card, i) => (
          <article
            key={card.index}
            data-testid="article-card"
            className={`fc-node fc-dir-l article-body-card${on}`}
            aria-label={`${card.index} ${card.title}`}
            style={{ ...CARD, ...dl(D.card0 + i * D.cardStep) }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: INK,
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 999,
                  padding: '1px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.index}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.04em', color: INK }}>{card.title}</span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '22px', fontWeight: 500, color: INK }}>
              {card.body}
            </p>
            {card.related?.length ? (
              <ul data-testid="article-related" style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {card.related.map((rel) => (
                  <li key={rel.href}>
                    <a
                      href={rel.href}
                      style={{
                        display: 'inline-block',
                        minHeight: 36,
                        padding: '6px 0',
                        color: 'rgba(118,167,189,0.98)',
                        fontSize: 13,
                        lineHeight: '20px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {rel.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className={`fc-node fc-dir-l${on}`} style={{ marginTop: 16, textAlign: 'center', ...dl(D.link) }}>
        <a
          href={doc.href}
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
        >
          閱讀全文 →
        </a>
        <button
          type="button"
          aria-label="關閉文章面板"
          onClick={onClose}
          style={{
            display: 'block',
            margin: '12px auto 0',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          關閉
        </button>
      </div>
    </section>
  );
}

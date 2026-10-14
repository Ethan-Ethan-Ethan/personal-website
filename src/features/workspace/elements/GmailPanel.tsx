import gmailDigest from '../core/gmail-digest.json';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';

export type DigestTopic = 'study' | 'invest' | 'promo';
export type DigestItem = {
  topic: DigestTopic;
  angle: '功用' | '因果' | '解決';
  claim: string;
  date: string;
  source: string;
  link?: string;
  links?: string[];
  expiry?: string;
};
export type DigestDoc = {
  _generated: string;
  week: string;
  sources: string[];
  items: DigestItem[];
};

const TOPICS: { key: DigestTopic; label: string }[] = [
  { key: 'study', label: '學習資訊' },
  { key: 'invest', label: '投資' },
  { key: 'promo', label: '本月促銷優惠' },
];
const ANGLES = ['功用', '因果', '解決'] as const;

/** 快照形狀驗證（缺段／空卡／angle-claim 空→視為缺快照，走誠實空態，不假掛）。 */
function asValidDigest(doc: unknown): DigestDoc | null {
  if (!doc || typeof doc !== 'object') return null;
  const d = doc as Partial<DigestDoc>;
  if (typeof d.week !== 'string' || !Array.isArray(d.items) || !d.items.length) return null;
  for (const t of TOPICS) {
    if (!d.items.some((i) => i?.topic === t.key)) return null;
  }
  for (const i of d.items) {
    if (!i || !(ANGLES as readonly string[]).includes(i.angle) || !i.claim?.trim()) return null;
  }
  return d as DigestDoc;
}

/** 促銷過期判定（expiry 內末組 MM/DD 當年末日；無起算日的「限定 N 天」不判定，不過期）。 */
export function isExpired(expiry: string | undefined, now: Date = new Date()): boolean {
  if (!expiry) return false;
  const all = [...expiry.matchAll(/(\d{1,2})\/(\d{1,2})/g)];
  if (all.length) {
    const last = all[all.length - 1];
    return now > new Date(now.getFullYear(), Number(last[1]) - 1, Number(last[2]), 23, 59, 59);
  }
  if (/年底前截止/.test(expiry)) return now > new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  return false;
}

const INK = '#ffffff';

export default function GmailPanel({ open, digest }: { open: boolean; digest?: DigestDoc | null }) {
  // 未傳 digest 才讀靜態 bake 產物（build-embed，零 runtime fetch）；傳 null 即強制空態（測用）。
  const doc = digest === undefined ? asValidDigest(gmailDigest) : digest ? asValidDigest(digest) : null;
  const on = open ? ' is-open' : '';
  return (
    <section
      aria-label="Gmail 本週重點"
      className={`gmail-panel${on}`}
      style={{
        position: 'absolute', top: '12%', left: '9%', zIndex: 3,
        width: 'min(560px, 82vw)', maxHeight: '72vh', overflowY: 'auto',
        pointerEvents: open ? 'auto' : 'none',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
      <style>{`.gmail-panel{scrollbar-width:thin;}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}@media (max-width: 900px){.gmail-panel{left:5% !important;width:auto !important;right:5% !important;max-height:52vh;}}@media (prefers-reduced-motion: reduce){.gmail-panel .fc-node{transition:none;}}`}</style>
      {!doc ? (
        <div
          className={`fc-node fc-dir-l${on}`}
          style={{
            background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            padding: '20px 22px', color: INK,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600 }}>本週重點尚未 bake</div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: '20px', color: 'rgba(255,255,255,0.75)' }}>
            快照缺失或形狀不合，不陳列條目。請跑 `node scripts/sync-gmail.mjs` 重 bake。
          </div>
        </div>
      ) : (
        <>
          <div className={`fc-node fc-dir-l${on}`} style={{ marginBottom: 12 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: INK, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)',
              borderRadius: 999, padding: '3px 10px',
            }}>
              本週重點 {doc.week}
            </span>
            <div style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
              Gmail 整理專案
            </div>
          </div>
          {TOPICS.map((t) => (
            <div key={t.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                {t.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {doc.items.filter((i) => i.topic === t.key).map((item) => {
                  const expired = item.topic === 'promo' && isExpired(item.expiry);
                  return (
                    <article
                      key={`${item.topic}:${item.claim}`}
                      className={`fc-node fc-dir-l${on}`}
                      aria-label={`${item.angle}：${item.claim}`}
                      style={{
                        background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
                        borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                        padding: '12px 16px', opacity: expired ? 0.55 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, letterSpacing: '0.1em', color: INK,
                          border: '1px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '1px 8px',
                          whiteSpace: 'nowrap',
                        }}>
                          【{item.angle}】
                        </span>
                        {expired ? (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '1px 8px' }}>
                            已過期
                          </span>
                        ) : null}
                        {item.expiry && !expired ? (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{item.expiry}</span>
                        ) : null}
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '22px', fontWeight: 500, color: INK }}>
                        {item.claim}
                      </p>
                      <div style={{ marginTop: 6, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
                        {item.date || '–'}，{item.source || '–'}
                        {item.link ? (
                          <>
                            {' — '}
                            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.85)' }}>
                              原文連結
                            </a>
                          </>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

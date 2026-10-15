import gmailDigest from '../core/gmail-digest.json';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';
import type { CSSProperties } from 'react';

export type DigestTopic = 'study' | 'invest' | 'promo' | 'flash';
export type DigestItem = {
  topic: DigestTopic;
  angle: '功用' | '因果' | '解決' | '資訊';
  claim: string;
  date: string;
  source: string;
  link?: string;
  links?: string[];
  expiry?: string;
  top3?: boolean;
};
export type DigestDoc = {
  _generated: string;
  week: string;
  weekRange?: string;
  sources: string[];
  items: DigestItem[];
};

const TOPICS: { key: DigestTopic; label: string }[] = [
  { key: 'study', label: '學習' },
  { key: 'invest', label: '投資' },
  { key: 'promo', label: '本月促銷優惠' },
  { key: 'flash', label: '快訊' },
];
// 資訊=直陳無痛點（放假政策／版本更新／功能通知等），bake 只做存在性斷言、永不分類。
const ANGLES = ['功用', '因果', '解決', '資訊'] as const;

/** 快照形狀驗證（缺段／空卡／angle-claim 空／【頂】非恰 4→視為缺快照，走誠實空態，不假掛）。 */
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
  if (d.items.filter((i) => i?.top3 === true).length !== 4) return null;
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

/** 卡片全部連結（links 全收、panel 最多渲染 3 個；單 link 回退相容）。 */
export function cardLinks(item: Pick<DigestItem, 'link' | 'links'>): string[] {
  const all = item.links?.length ? item.links : item.link ? [item.link] : [];
  return all.slice(0, 3);
}

/** 促銷時效排序鍵（expiry 末組 MM/DD；無日期不過期排最後）。保留供測用，時效榜已刪。 */
export function expiryKey(item: Pick<DigestItem, 'expiry'>): number {
  if (!item.expiry) return 9999;
  const all = [...item.expiry.matchAll(/(\d{1,2})\/(\d{1,2})/g)];
  if (all.length) {
    const last = all[all.length - 1];
    return Number(last[1]) * 100 + Number(last[2]);
  }
  if (/年底前截止/.test(item.expiry)) return 1231;
  return 9999;
}

const INK = '#ffffff';
const CARD: CSSProperties = {
  background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
  borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  padding: '12px 16px',
};
// 左欄精選平鋪卡：實底無玻璃（無 blur、無白邊，僅極細描邊定界，圓角保留 16）。
const TOP3_CARD: CSSProperties = {
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '16px 18px',
};
const CHIP: CSSProperties = {
  fontSize: 11, letterSpacing: '0.1em', color: INK,
  border: '1px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '1px 8px',
  whiteSpace: 'nowrap',
};

/** 開場 stagger（ms，仿 ForecastGlass D.*：header chip wipe 100 → 標題 200 → 精選卡 300+i*70 → 右欄組 400+i*70；關閉一律 0ms 同收）。只認精選卡數量（300+i*70 自動延展，不寫死上限），不寫死內容。 */
const D = { chip: 100, title: 200, top0: 300, topStep: 70, rail0: 400, railStep: 70 } as const;

function LinkList({ item }: { item: DigestItem }) {
  const ls = cardLinks(item);
  if (!ls.length) return null;
  return (
    <>
      {' — '}
      {ls.map((u, i) => (
        <span key={u}>
          {i > 0 ? '／' : null}
          <a href={u} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {ls.length > 1 ? `原文連結${i + 1}` : '原文連結'}
          </a>
        </span>
      ))}
    </>
  );
}

function FullCard({ item, on }: { item: DigestItem; on: string }) {
  const expired = item.topic === 'promo' && isExpired(item.expiry);
  return (
    <article
      key={`${item.topic}:${item.claim}`}
      className={`fc-node fc-dir-l gmail-full-card${on}`}
      aria-label={`${item.claim}`}
      style={{ ...CARD, opacity: expired ? 0.55 : 1 }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
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
        <LinkList item={item} />
      </div>
    </article>
  );
}

/** 左欄精選平鋪卡：字體跟氣溫頁（claim 17px 600 白字＋CJK 0.05em 追蹤、meta 11px muted）。 */
function Top3Card({ item, on, delay }: { item: DigestItem; on: string; delay: string }) {
  return (
    <article
      key={`top3:${item.topic}:${item.claim}`}
      data-testid="top3-flat"
      className={`fc-node fc-dir-l gmail-top3-card${on}`}
      aria-label={`本週精選｜${item.claim}`}
      style={{ ...TOP3_CARD, transitionDelay: delay }}
    >
      <p style={{ margin: 0, fontSize: 17, lineHeight: '26px', fontWeight: 600, color: INK, letterSpacing: '0.05em' }}>
        {item.claim}
      </p>
      <div style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
        {item.date || '–'}，{item.source || '–'}
        <LinkList item={item} />
      </div>
    </article>
  );
}

export default function GmailPanel({ open, digest }: { open: boolean; digest?: DigestDoc | null }) {
  // 未傳 digest 才讀靜態 bake 產物（build-embed，零 runtime fetch）；傳 null 即強制空態（測用）。
  const doc = digest === undefined ? asValidDigest(gmailDigest) : digest ? asValidDigest(digest) : null;
  const on = open ? ' is-open' : '';
  const top3 = (doc?.items ?? []).filter((i) => i.top3 === true);
  // 仿 ForecastGlass：開場 delay stagger，關閉一律 0ms 同收。
  const dl = (ms: number): { transitionDelay: string } => ({ transitionDelay: open ? `${ms}ms` : '0ms' });
  return (
    <>
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
        <style>{`.gmail-panel{scrollbar-width:thin;overflow-x:hidden;}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}.fc-dir-r{transform:translateX(30px) scale(.985);}.fc-wipe-r{clip-path:inset(0 100% 0 0);transform:none;}.gmail-panel details>summary{cursor:pointer;}@media (max-width: 900px){.gmail-panel{left:5% !important;width:auto !important;right:5% !important;max-height:52vh !important;}.gmail-top3-card{background:rgba(0,0,0,0.62) !important;}.gmail-full-card{background:rgba(255,255,255,0.16) !important;border-color:rgba(255,255,255,0.28) !important;}.gmail-rail{position:static !important;width:auto !important;max-width:none !important;margin:16px 5% 0 !important;max-height:none !important;overflow:visible !important;pointer-events:auto !important;}}@media (prefers-reduced-motion: reduce){.gmail-panel .fc-node{transition:none;}}`}</style>
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
            <div data-testid="gmail-head" className={`fc-node fc-wipe-r${on}`} style={{ marginBottom: 12, ...dl(D.chip) }}>
              <span style={{
                display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: INK, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)',
                borderRadius: 999, padding: '3px 10px',
              }}>
                本週重點 {doc.week}{doc.weekRange ? ` · ${doc.weekRange}` : ""}
              </span>
              <div style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
                Gmail 整理專案
                {' · '}
                <a href="mailto:isitoled@gmail.com" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  寫信給我
                </a>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div data-testid="gmail-title" className={`fc-node fc-dir-l${on}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, ...dl(D.title) }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: INK }}>
                  本週精選TOP4
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {top3.map((item, i) => (
                  <Top3Card key={`top3:${item.topic}:${item.claim}`} item={item} on={on} delay={open ? `${D.top0 + i * D.topStep}ms` : '0ms'} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
      {doc ? (
        <aside
          aria-label="重點側欄"
          className="gmail-rail"
          // 幾何抄 ForecastGlass 右欄：top 12%／right 38／寬 300／80vh 捲動；手機靜態堆疊（見 .gmail-panel style 內 media）。
          style={{
            position: 'absolute', top: '12%', right: 38, width: 300, zIndex: 3,
            display: 'flex', flexDirection: 'column', gap: 14,
            maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden',
            pointerEvents: open ? 'auto' : 'none',
            visibility: open ? 'visible' : 'hidden',
          }}
        >
          {TOPICS.map((t, idx) => {
            const cards = doc.items.filter((i) => i.topic === t.key);
            return (
              <div key={t.key} className={`fc-node fc-dir-r${on}`} style={{ ...CARD, padding: '14px 16px', ...dl(D.rail0 + idx * D.railStep) }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: INK }}>
                    {t.label}
                  </span>
                  <span style={{ ...CHIP, fontWeight: 400 }}>{cards.length} 條</span>
                </div>
                <details data-testid={`rail-full-${t.key}`}>
                  <summary style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em' }}>
                    看全表（{cards.length} 條）
                  </summary>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {cards.map((item) => (
                      <FullCard key={`${item.topic}:${item.claim}`} item={item} on={on} />
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </aside>
      ) : null}
    </>
  );
}

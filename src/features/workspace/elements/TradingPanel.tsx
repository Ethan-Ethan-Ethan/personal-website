import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { FC_TRANSITION_CSS } from '../core/forecast-transitions';
import {
  TRADING_DISCLAIMER,
  formatGeneratedZh,
  loadTradingSnapshot,
  type MarketKey,
} from '../core/trading-snapshot';

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

const TABS: { key: MarketKey; label: string }[] = [
  { key: 'btc', label: '比特幣' },
  { key: 'txf', label: '台指期' },
];

const D = { chip: 100, title: 200, chart: 280, note: 400, disclaimer: 520 } as const;

function TradingViewEmbed({ symbol, active }: { symbol: string; active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !active) return;
    host.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    wrap.style.height = '100%';
    wrap.style.width = '100%';
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.height = '100%';
    inner.style.width = '100%';
    wrap.appendChild(inner);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '5',
      timezone: 'Asia/Taipei',
      theme: 'dark',
      style: '1',
      locale: 'zh_TW',
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: true,
      hide_legend: false,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    });
    wrap.appendChild(script);
    host.appendChild(wrap);
    return () => {
      host.innerHTML = '';
    };
  }, [symbol, active]);

  return (
    <div
      ref={hostRef}
      data-testid="tradingview-host"
      style={{
        height: 340,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.35)',
      }}
    />
  );
}

export default function TradingPanel({ open }: { open: boolean }) {
  const doc = useMemo(() => loadTradingSnapshot(), []);
  const [tab, setTab] = useState<MarketKey>('btc');

  const on = open ? ' is-open' : '';
  const dl = (ms: number): { transitionDelay: string } => ({ transitionDelay: open ? `${ms}ms` : '0ms' });
  const market = doc?.markets[tab];
  const symbol = market?.symbol_tv ?? (tab === 'btc' ? 'MEXC:BTCUSDT' : 'TAIFEX:TXF1!');
  const generated = doc ? formatGeneratedZh(doc._generated) : '—';

  return (
    <section
      aria-label="交易自動化"
      className={`trading-panel${on}`}
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
      <style>{`.trading-panel{scrollbar-width:thin;overflow-x:hidden;}${FC_TRANSITION_CSS}.fc-dir-l{transform:translateX(-26px);}.fc-wipe-r{clip-path:inset(0 100% 0 0);transform:none;}@media (max-width: 900px){.trading-panel{top:0 !important;left:0 !important;right:0 !important;bottom:110px !important;width:auto !important;max-height:none !important;overflow-y:auto !important;padding:96px 5% 130px;}.trading-body-card{background:rgba(255,255,255,0.16) !important;border-color:rgba(255,255,255,0.28) !important;}}@media (prefers-reduced-motion: reduce){.trading-panel .fc-node{transition:none;}}`}</style>

      <div className={`fc-node fc-wipe-r${on}`} style={{ marginBottom: 12, ...dl(D.chip) }}>
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
          Automation · 5m
        </span>
      </div>

      <header className={`fc-node fc-wipe-r${on}`} style={{ marginBottom: 14, ...dl(D.title) }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: INK, letterSpacing: '0.02em' }}>
          交易自動化
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
          快照更新：{generated}
        </p>
      </header>

      <div
        className={`fc-node fc-dir-l trading-body-card${on}`}
        style={{ ...CARD, marginBottom: 12, ...dl(D.chart) }}
      >
        <div
          role="tablist"
          aria-label="品種"
          style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
        >
          {TABS.map(({ key, label }) => {
            const selected = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(key)}
                style={{
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 999,
                  padding: '5px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: INK,
                  background: selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {open ? <TradingViewEmbed symbol={symbol} active /> : null}
      </div>

      <div className={`fc-node fc-dir-l${on}`} style={{ ...CARD, marginBottom: 12, ...dl(D.note) }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14, color: INK }}>5 分鐘觀察（文字）</h3>
        {market?.pending ? (
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>
            {market.method_note}
          </p>
        ) : (
          <>
            {market?.bias ? (
              <p style={{ margin: '0 0 6px', fontSize: 13, color: INK }}>
                本根偏向：<strong>{market.bias}</strong>
              </p>
            ) : null}
            {market?.summary ? (
              <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                {market.summary}
              </p>
            ) : null}
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
              {market?.method_note}
            </p>
          </>
        )}
      </div>

      <p
        className={`fc-node fc-dir-l${on}`}
        data-testid="trading-disclaimer"
        style={{
          margin: 0,
          fontSize: 11,
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.62)',
          ...dl(D.disclaimer),
        }}
      >
        {TRADING_DISCLAIMER}
      </p>
    </section>
  );
}

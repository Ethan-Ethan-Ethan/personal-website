import { useEffect, useState } from 'react';
import SplitText from '../../../components/reactbits/SplitText';
import type { FORECAST_PLACEHOLDER } from '../core/forecast-placeholder';

type Props = {
  data: typeof FORECAST_PLACEHOLDER;
};

const GLASS = 'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl';
const INK = '#ffffff';

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return reduced;
}

export default function ForecastGlass({ data }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <section
      aria-label="Forecast"
      style={{ position: 'absolute', top: '15%', left: '9%', maxWidth: 560, width: 'min(560px, 82vw)', pointerEvents: 'auto', zIndex: 3 }}
    >
      <style>{`.forecast-glass{position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.35);}.forecast-glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.03) 28%,transparent 45%);}@media (prefers-reduced-motion: reduce){.forecast-glass .hero-line{animation:none !important;opacity:1 !important;transform:none !important;}}`}</style>
      <div className={`forecast-glass ${GLASS}`} style={{ padding: '28px 32px' }}>
        <span
          style={{
            display: 'inline-block', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: INK, opacity: 0.85, border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 999, padding: '4px 12px', marginBottom: 16,
          }}
        >
          {data.chip}
        </span>
        <h1 style={{ margin: 0, color: INK, fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.02, letterSpacing: '-0.02em', fontWeight: 600 }}>
          {data.heroLines.map((line) =>
            reducedMotion ? (
              <span key={line} style={{ display: 'block' }}>{line}</span>
            ) : (
              <SplitText
                key={line}
                text={line}
                tag="span"
                textAlign="left"
                splitType="chars"
                delay={30}
                duration={0.9}
                ease="power2.out"
                from={{ opacity: 0, y: 18 }}
                to={{ opacity: 1, y: 0 }}
              />
            )
          )}
        </h1>
        <p style={{ margin: '16px 0 0', maxWidth: 480, fontSize: 15.2, lineHeight: '24px', fontWeight: 500, letterSpacing: '-0.3px', color: 'rgba(255,255,255,0.95)' }}>
          {data.blurb}
        </p>
      </div>
    </section>
  );
}

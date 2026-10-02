const MOBILE_MEDIA_QUERY = '(max-width: 520px), (min-width: 521px) and (max-width: 767px) and (pointer: coarse)';

export default function ForegroundOcclusion() {
  return <picture className="computer-foreground" aria-hidden="true">
    <source media={MOBILE_MEDIA_QUERY} srcSet="/assets/galaxy/foreground-occluder-mobile-v3.webp" />
    <img src="/assets/galaxy/foreground-occluder-v3.webp" alt="" draggable={false} />
  </picture>;
}

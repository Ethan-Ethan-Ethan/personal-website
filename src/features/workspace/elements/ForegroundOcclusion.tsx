export default function ForegroundOcclusion() {
  return <picture className="computer-foreground" aria-hidden="true">
    <source media="(max-width: 767px)" srcSet="/assets/galaxy/workspace-mobile-foreground-alpha.webp" />
    <img src="/assets/galaxy/workspace-foreground-alpha.webp" alt="" draggable={false} />
  </picture>;
}

export default function SceneAtmosphere() {
  return <>
    <div className="sky-aperture" aria-hidden="true">
      <div className="visible-starfield">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
      <div className="shooting-star" />
    </div>
  </>;
}

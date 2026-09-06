import GalaxyCanvas from './GalaxyCanvas';

export default function SceneAtmosphere() {
  return <>
    <div className="galaxy-window"><GalaxyCanvas /></div>
    <div className="visible-starfield" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
    <div className="shooting-star" aria-hidden="true" />
    <div className="scene-vignette" aria-hidden="true" />
    <div className="warm-room-light" aria-hidden="true" />
    <div className="desk-reflection" aria-hidden="true" />
    <div className="room-dust" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
    <div className="lamp-glow" aria-hidden="true" />
    <div className="plant-sway plant-sway-left" aria-hidden="true" />
    <div className="plant-sway plant-sway-right" aria-hidden="true" />
  </>;
}

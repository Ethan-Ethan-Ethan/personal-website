export default function PlushCharacter() {
  return <>
    <div className="plush-cape-rig" aria-hidden="true">
      <span className="cape-segment cape-upper" />
      <span className="cape-segment cape-middle" />
      <span className="cape-segment cape-tail" />
    </div>
    <div className="plush-reactor" aria-hidden="true" />
    <div className="plush-motion" aria-hidden="true">
      <span className="plush-eye eye-left" />
      <span className="plush-eye eye-right" />
    </div>
  </>;
}

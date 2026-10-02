import type { WorkspaceWindowId } from '../core/window-state';
import SceneAtmosphere from './SceneAtmosphere';
import ForegroundOcclusion from './ForegroundOcclusion';
import PlushCharacter from './PlushCharacter';
import ComputerHotspots from './ComputerHotspots';

type Props = {
  registerLauncher: (id: WorkspaceWindowId, node: HTMLButtonElement | null) => void;
};

export default function WorkspaceScene(props: Props) {
  return <section className="workspace-scene" aria-labelledby="workspace-title">
    <SceneAtmosphere />
    <ForegroundOcclusion />
    <PlushCharacter />
    <header className="workspace-brand">
      <a className="brand-chip" href="/" aria-label="Ethan Yang 首頁"><span>EY</span><strong>Ethan Yang</strong></a>
      <nav aria-label="快速連結"><a href="/articles/">Articles</a><a href="/resume">Resume</a></nav>
    </header>
    <div className="workspace-copy">
      <p>ETHAN YANG · AI SYSTEM BUILDER</p>
      <h1 id="workspace-title">A cozy corner<br/>of the AI galaxy</h1>
      <span>把 AI、知識圖譜、影片理解與量化研究，做成可測試、可重複的工具。</span>
    </div>
    <ComputerHotspots registerLauncher={props.registerLauncher} />
  </section>;
}

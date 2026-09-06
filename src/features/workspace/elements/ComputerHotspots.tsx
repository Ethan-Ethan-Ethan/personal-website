import { useEffect, useState } from 'react';
import type { WorkspaceWindowId } from '../core/window-state';
import { WORKSPACE_APPS } from '../core/contracts';

type Props = {
  sceneLabel: string;
  onPreview: (id: WorkspaceWindowId) => void;
  onClearPreview: () => void;
  onOpen: (id: WorkspaceWindowId, launcher: HTMLButtonElement) => void;
  registerLauncher: (id: WorkspaceWindowId, node: HTMLButtonElement | null) => void;
};

export default function ComputerHotspots({ sceneLabel, onPreview, onClearPreview, onOpen, registerLauncher }: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return <div className="monitor-shell" aria-label="工作室電腦">
    <div className="monitor-screen">
      <div className="app-grid">
        {WORKSPACE_APPS.map((app, index) => <button
          key={app.id}
          type="button"
          disabled={!hydrated}
          className="app-button"
          data-app-id={app.id}
          ref={(node) => registerLauncher(app.id, node)}
          onMouseEnter={() => onPreview(app.id)}
          onMouseLeave={onClearPreview}
          onFocus={() => onPreview(app.id)}
          onBlur={onClearPreview}
          onClick={(event) => onOpen(app.id, event.currentTarget)}
          aria-label={`Open ${app.label}`}
        >
          <span className="app-number">0{index + 1}</span>
          <span className="app-icon">{app.icon}</span>
          <strong>{app.label}</strong>
          <small>{app.eyebrow}</small>
        </button>)}
        <div className="scene-pointer" aria-hidden="true" />
        <div className="scene-state-label" aria-hidden="true">{sceneLabel}</div>
      </div>
    </div>
  </div>;
}

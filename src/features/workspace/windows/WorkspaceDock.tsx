import { WORKSPACE_APPS } from '../core/contracts';
import type { WorkspaceState, WorkspaceWindowId } from '../core/window-state';

type Props = {
  state: WorkspaceState;
  visible: boolean;
  blocked: boolean;
  onOpen: (id: WorkspaceWindowId) => void;
};

export default function WorkspaceDock({ state, visible, blocked, onOpen }: Props) {
  const interactive = visible && !blocked;
  return <div className={`workspace-dock ${visible ? 'is-visible' : ''}${blocked ? ' is-blocked' : ''}`} aria-label="Workspace apps" aria-hidden={interactive ? undefined : 'true'} inert={interactive ? undefined : true}>{WORKSPACE_APPS.map((app) => {
    const item = state.windows[app.id];
    return <button key={app.id} className={item.open && !item.minimized ? 'active' : ''} tabIndex={interactive ? 0 : -1} onClick={() => onOpen(app.id)} aria-label={`Open ${app.label}`}><span>{app.icon}</span><small>{app.label}</small>{item.open && <i/>}</button>;
  })}</div>;
}

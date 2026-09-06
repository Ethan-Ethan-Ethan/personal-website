import type { KeyboardEvent as ReactKeyboardEvent, MutableRefObject, PointerEvent as ReactPointerEvent } from 'react';
import { WORKSPACE_APPS, type ArticleLink, type PublicContent } from '../core/contracts';
import type { WorkspaceWindowId, WorkspaceWindowState } from '../core/window-state';
import ContentPanel from './ContentPanels';


const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function trapModalFocus(event: ReactKeyboardEvent<HTMLElement>, enabled: boolean) {
  if (!enabled || event.key !== 'Tab') return;
  const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.closest('[inert]') && element.getAttribute('aria-hidden') !== 'true');
  if (!focusable.length) {
    event.preventDefault();
    event.currentTarget.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

type Props = {
  windows: WorkspaceWindowState[];
  activeId: WorkspaceWindowId | null;
  mobileModal: boolean;
  content: PublicContent[];
  recentArticles: ArticleLink[];
  dialogRefs: MutableRefObject<Map<WorkspaceWindowId, HTMLElement>>;
  onFocus: (id: WorkspaceWindowId) => void;
  onBeginDrag: (event: ReactPointerEvent<HTMLDivElement>, id: WorkspaceWindowId) => void;
  onClose: (id: WorkspaceWindowId) => void;
  onMinimize: (id: WorkspaceWindowId) => void;
};

export default function WorkspaceWindows({ windows, activeId, mobileModal, content, recentArticles, dialogRefs, onFocus, onBeginDrag, onClose, onMinimize }: Props) {
  return <div className="workspace-windows" aria-live="polite">{windows.map((windowState) => {
    const app = WORKSPACE_APPS.find((item) => item.id === windowState.id)!;
    const isActive = activeId === windowState.id;
    const inaccessible = mobileModal && !isActive;
    return <section key={windowState.id} ref={(node) => { if (node) dialogRefs.current.set(windowState.id, node); else dialogRefs.current.delete(windowState.id); }} className={`workspace-dialog window-${windowState.id}${isActive ? ' is-active' : ''}`} role="dialog" aria-modal={mobileModal && isActive} aria-hidden={inaccessible ? 'true' : undefined} inert={inaccessible ? true : undefined} aria-labelledby={`window-title-${windowState.id}`} tabIndex={inaccessible ? undefined : -1} style={{ transform: `translate3d(${windowState.position.x}px, ${windowState.position.y}px, 0)`, zIndex: windowState.zIndex }} onKeyDown={(event) => trapModalFocus(event, mobileModal && isActive)} onFocusCapture={() => onFocus(windowState.id)} onPointerDown={() => onFocus(windowState.id)}>
      <div className="window-titlebar" onPointerDown={(event) => onBeginDrag(event, windowState.id)}><div className="traffic-lights"><button type="button" aria-label={`Close ${app.label}`} onClick={() => onClose(windowState.id)}/><button type="button" aria-label={`Minimize ${app.label}`} onClick={() => onMinimize(windowState.id)}/><span/></div><h2 id={`window-title-${windowState.id}`}>{app.label}</h2><span className="window-path">ethan://{windowState.id}</span></div>
      <div className="window-scroll"><ContentPanel id={windowState.id} content={content} recentArticles={recentArticles}/></div>
    </section>;
  })}</div>;
}

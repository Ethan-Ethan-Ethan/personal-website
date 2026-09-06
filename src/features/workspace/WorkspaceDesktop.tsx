import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createWorkspaceRuntimeState, executeWorkspaceCommand } from './core/command-bus';
import { WORKSPACE_APPS, type ArticleLink, type PublicContent, type WorkspaceCommand, type WorkspaceEffect, type WorkspaceRuntimeState } from './core/contracts';
import { clampWindowPosition, hashToWindowId, type WorkspaceWindowId } from './core/window-state';
import WorkspaceScene from './elements/WorkspaceScene';
import WorkspaceWindows from './windows/WorkspaceWindows';
import WorkspaceDock from './windows/WorkspaceDock';
import '../../styles/workspace.css';

export type { PublicContent } from './core/contracts';
type Props = { content: PublicContent[]; recentArticles: ArticleLink[] };

type DragState = { id: WorkspaceWindowId; dx: number; dy: number; width: number; height: number };

export default function WorkspaceDesktop({ content, recentArticles }: Props) {
  const [runtime, setRuntime] = useState<WorkspaceRuntimeState>(() => createWorkspaceRuntimeState());
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const runtimeRef = useRef(runtime);
  const dragRef = useRef<DragState | null>(null);
  const dialogRefs = useRef(new Map<WorkspaceWindowId, HTMLElement>());
  const launcherRefs = useRef(new Map<WorkspaceWindowId, HTMLButtonElement>());
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const urlFor = (id: WorkspaceWindowId | null) => `${window.location.pathname}${window.location.search}${id ? `#${id}` : ''}`;
  const applyEffects = (effects: WorkspaceEffect[]) => {
    for (const effect of effects) {
      if (effect.type === 'history.push') window.history.pushState(null, '', urlFor(effect.id));
      else window.history.replaceState(null, '', urlFor(effect.id));
    }
  };
  const runCommand = (command: WorkspaceCommand) => {
    const output = executeWorkspaceCommand(runtimeRef.current, command);
    if (!output.result.ok) return output;
    runtimeRef.current = output.state;
    setRuntime(output.state);
    applyEffects(output.effects);
    return output;
  };

  const registerLauncher = (id: WorkspaceWindowId, node: HTMLButtonElement | null) => {
    if (node) launcherRefs.current.set(id, node);
    else launcherRefs.current.delete(id);
  };
  const openWindow = (id: WorkspaceWindowId, launcher?: HTMLButtonElement) => {
    launcher?.blur();
    const current = runtimeRef.current.windows.windows[id];
    const wasActive = runtimeRef.current.windows.activeId === id && current.open && !current.minimized;
    runCommand({ type: 'window.open', id, history: 'push' });
    if (wasActive) dialogRefs.current.get(id)?.focus();
  };
  const focusWindow = (id: WorkspaceWindowId) => {
    if (runtimeRef.current.windows.activeId === id) return;
    runCommand({ type: 'window.focus', id });
  };
  const commitClosingCommand = (command: Extract<WorkspaceCommand, { type: 'window.close' | 'window.minimize' }>) => {
    const output = executeWorkspaceCommand(runtimeRef.current, command);
    if (!output.result.ok) return;
    restoreFocusRef.current = output.state.windows.activeId ? null : launcherRefs.current.get(command.id) ?? null;
    runtimeRef.current = output.state;
    setRuntime(output.state);
    applyEffects(output.effects);
  };

  useEffect(() => {
    setHydrated(true);
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener('change', updateMobile);
    runCommand({ type: 'window.reconcile', id: hashToWindowId(window.location.hash) });
    return () => mobileQuery.removeEventListener('change', updateMobile);
  }, []);

  useEffect(() => {
    const activeId = runtime.windows.activeId;
    if (activeId) {
      const dialog = dialogRefs.current.get(activeId);
      if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
    }
    else if (restoreFocusRef.current) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [runtime.windows.activeId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const activeId = runtimeRef.current.windows.activeId;
      if (event.key === 'Escape' && activeId) commitClosingCommand({ type: 'window.close', id: activeId });
    };
    const onHistory = () => {
      const activeId = runtimeRef.current.windows.activeId;
      const nextId = hashToWindowId(window.location.hash);
      if (activeId && !nextId) restoreFocusRef.current = launcherRefs.current.get(activeId) ?? null;
      runCommand({ type: 'window.reconcile', id: nextId });
    };
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || window.innerWidth < 768) return;
      runCommand({ type: 'window.move', id: drag.id, position: clampWindowPosition(
        { x: event.clientX - drag.dx, y: event.clientY - drag.dy },
        { width: window.innerWidth, height: window.innerHeight },
        { width: drag.width, height: drag.height },
      ) });
    };
    const onPointerUp = () => { dragRef.current = null; document.body.classList.remove('is-dragging-window'); };
    const onResize = () => {
      for (const item of Object.values(runtimeRef.current.windows.windows)) {
        if (!item.open || item.minimized || window.innerWidth < 768) continue;
        const rect = dialogRefs.current.get(item.id)?.getBoundingClientRect();
        if (!rect) continue;
        runCommand({ type: 'window.move', id: item.id, position: clampWindowPosition(
          item.position,
          { width: window.innerWidth, height: window.innerHeight },
          { width: rect.width, height: rect.height },
        ) });
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onHistory);
    window.addEventListener('hashchange', onHistory);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('hashchange', onHistory);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, id: WorkspaceWindowId) => {
    if (window.innerWidth < 768 || (event.target as HTMLElement).closest('button')) return;
    const frame = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!frame) return;
    focusWindow(id);
    dragRef.current = { id, dx: event.clientX - frame.left, dy: event.clientY - frame.top, width: frame.width, height: frame.height };
    document.body.classList.add('is-dragging-window');
  };

  const previewState = (id: WorkspaceWindowId) => runCommand({ type: 'scene.preview', target: id });
  const clearPreview = () => runCommand(runtimeRef.current.windows.activeId ? { type: 'scene.preview', target: runtimeRef.current.windows.activeId } : { type: 'scene.reset' });
  const sceneLabel = runtime.scene === 'idle' ? 'EXPLORE THE WORKSHOP' : WORKSPACE_APPS.find((app) => app.id === runtime.scene)?.eyebrow ?? '';
  const sortedWindows = useMemo(() => Object.values(runtime.windows.windows).filter((item) => item.open && !item.minimized).sort((a, b) => a.zIndex - b.zIndex), [runtime.windows.windows]);
  const hasOpenWindow = Object.values(runtime.windows.windows).some((item) => item.open);
  const mobileModalActive = isMobile && runtime.windows.activeId !== null;

  return <main id="main-content" className="workspace-page" data-hydrated={hydrated} data-scene-state={runtime.scene}>
    <div className="workspace-scene-guard" inert={mobileModalActive ? true : undefined} aria-hidden={mobileModalActive ? 'true' : undefined}>
      <WorkspaceScene sceneLabel={sceneLabel} onPreview={previewState} onClearPreview={clearPreview} onOpen={openWindow} registerLauncher={registerLauncher} />
    </div>
    <WorkspaceWindows windows={sortedWindows} activeId={runtime.windows.activeId} mobileModal={mobileModalActive} content={content} recentArticles={recentArticles} dialogRefs={dialogRefs} onFocus={focusWindow} onBeginDrag={beginDrag} onClose={(id) => commitClosingCommand({ type: 'window.close', id })} onMinimize={(id) => commitClosingCommand({ type: 'window.minimize', id })} />
    <WorkspaceDock state={runtime.windows} visible={hasOpenWindow} blocked={mobileModalActive} onPreview={previewState} onClearPreview={clearPreview} onOpen={openWindow} />
  </main>;
}

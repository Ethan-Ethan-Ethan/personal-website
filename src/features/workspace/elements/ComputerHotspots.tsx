import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';
import type { WorkspaceWindowId } from '../core/window-state';
import { WORKSPACE_APPS } from '../core/contracts';
import { computeHotspotLayout, type HotspotLayout } from './hotspot-layout';

export const PREVIEW_CLOSE_DELAY_MS = 100;
const POPOVER_ID = 'workspace-hotspot-popover';
type PreviewLayoutState = { id: WorkspaceWindowId; value: HotspotLayout };

type Props = {
  registerLauncher: (id: WorkspaceWindowId, node: HTMLButtonElement | null) => void;
};

export default function ComputerHotspots({ registerLauncher }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<WorkspaceWindowId | null>(null);
  const [layoutState, setLayoutState] = useState<PreviewLayoutState | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const hotspotRefs = useRef(new Map<WorkspaceWindowId, HTMLButtonElement>());
  const bottomRefs = useRef(new Map<WorkspaceWindowId, HTMLButtonElement>());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerOwnerRef = useRef<WorkspaceWindowId | null>(null);
  const focusOwnerRef = useRef<WorkspaceWindowId | null>(null);
  const registerLauncherRef = useRef(registerLauncher);
  registerLauncherRef.current = registerLauncher;

  const hotspotRefCallbacks = useMemo(() => Object.fromEntries(WORKSPACE_APPS.map((app) => [
    app.id,
    (node: HTMLButtonElement | null) => {
      if (node) hotspotRefs.current.set(app.id, node);
      else hotspotRefs.current.delete(app.id);
      registerLauncherRef.current(app.id, node);
    },
  ])) as Record<WorkspaceWindowId, (node: HTMLButtonElement | null) => void>, []);

  const bottomRefCallbacks = useMemo(() => Object.fromEntries(WORKSPACE_APPS.map((app) => [
    app.id,
    (node: HTMLButtonElement | null) => {
      if (node) bottomRefs.current.set(app.id, node);
      else bottomRefs.current.delete(app.id);
    },
  ])) as Record<WorkspaceWindowId, (node: HTMLButtonElement | null) => void>, []);

  const cancelClose = () => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const closePreview = () => {
    cancelClose();
    pointerOwnerRef.current = null;
    focusOwnerRef.current = null;
    setActivePreviewId(null);
    setLayoutState(null);
  };

  const showPreview = (id: WorkspaceWindowId) => {
    cancelClose();
    if (id !== activePreviewId) setLayoutState(null);
    setActivePreviewId(id);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      const owner = pointerOwnerRef.current ?? focusOwnerRef.current;
      if (owner) {
        showPreview(owner);
        return;
      }
      setActivePreviewId(null);
      setLayoutState(null);
    }, PREVIEW_CLOSE_DELAY_MS);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && rootRef.current?.contains(nextTarget)) {
      const nextId = nextTarget instanceof Element
        ? nextTarget.closest<HTMLElement>('[data-window-id]')?.dataset.windowId as WorkspaceWindowId | undefined
        : undefined;
      if (nextId) {
        focusOwnerRef.current = nextId;
        showPreview(nextId);
      }
      cancelClose();
      return;
    }
    focusOwnerRef.current = null;
    scheduleClose();
  };

  const handlePointerEnter = (id: WorkspaceWindowId) => () => {
    pointerOwnerRef.current = id;
    showPreview(id);
  };

  const handlePointerLeave = () => {
    pointerOwnerRef.current = null;
    scheduleClose();
  };

  const handleFocus = (id: WorkspaceWindowId) => {
    focusOwnerRef.current = id;
    showPreview(id);
  };

  const handleClick = (id: WorkspaceWindowId) => {
    focusOwnerRef.current = id;
    showPreview(id);
  };

  useEffect(() => {
    setHydrated(true);
    const handleOutsidePointer = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) closePreview();
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      cancelClose();
    };
  }, []);

  useEffect(() => {
    if (!activePreviewId) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closePreview();
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [activePreviewId]);

  useEffect(() => {
    if (!activePreviewId) {
      setLayoutState(null);
      return;
    }

    const measure = () => {
      const root = rootRef.current;
      const popover = popoverRef.current;
      const hotspot = hotspotRefs.current.get(activePreviewId);
      const target = bottomRefs.current.get(activePreviewId);
      if (!root || !popover || !hotspot || !target) return;
      setLayoutState({
        id: activePreviewId,
        value: computeHotspotLayout({
          scene: root.getBoundingClientRect(),
          hotspot: hotspot.getBoundingClientRect(),
          target: target.getBoundingClientRect(),
          popover: popover.getBoundingClientRect(),
        }),
      });
    };

    const scheduleMeasure = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        measure();
      });
    };

    measure();
    scheduleMeasure();
    const observed = [rootRef.current, popoverRef.current, hotspotRefs.current.get(activePreviewId), bottomRefs.current.get(activePreviewId)]
      .filter((node): node is Element => Boolean(node));
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure);
    observed.forEach((node) => observer?.observe(node));
    window.addEventListener('resize', scheduleMeasure);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [activePreviewId]);

  const activeApp = WORKSPACE_APPS.find((app) => app.id === activePreviewId) ?? null;
  const layout = layoutState?.id === activePreviewId ? layoutState.value : null;

  return <div
    ref={rootRef}
    className="workspace-preview-system"
    data-active-window-id={activePreviewId ?? undefined}
  >
    <div className="monitor-shell" aria-label="工作室電腦">
      <div className="monitor-screen">
        <div className="app-grid hotspot-grid">
          {WORKSPACE_APPS.map((app) => {
            const active = activePreviewId === app.id;
            return <button
              key={app.id}
              type="button"
              disabled={!hydrated}
              className="app-button hotspot-trigger"
              data-app-id={app.id}
              data-window-id={app.id}
              data-trigger-source="hotspot"
              ref={hotspotRefCallbacks[app.id]}
              onPointerEnter={handlePointerEnter(app.id)}
              onPointerLeave={handlePointerLeave}
              onFocus={() => handleFocus(app.id)}
              onBlur={handleBlur}
              onClick={() => handleClick(app.id)}
              aria-label={`Preview ${app.label} from monitor`}
              aria-controls={active ? POPOVER_ID : undefined}
              aria-expanded={active}
            >
              <span className="hotspot-icon-frame" aria-hidden="true">{app.icon}</span>
            </button>;
          })}
        </div>
      </div>
    </div>

    <div className="workspace-bottom-links" role="group" aria-label="Explore workspace sections">
      {WORKSPACE_APPS.map((app) => {
        const active = activePreviewId === app.id;
        return <button
          key={app.id}
          type="button"
          disabled={!hydrated}
          className="bottom-link-trigger"
          data-window-id={app.id}
          data-trigger-source="bottom-link"
          ref={bottomRefCallbacks[app.id]}
          onPointerEnter={handlePointerEnter(app.id)}
          onPointerLeave={handlePointerLeave}
          onFocus={() => handleFocus(app.id)}
          onBlur={handleBlur}
          onClick={() => handleClick(app.id)}
          aria-label={`Preview ${app.label} from bottom navigation`}
          aria-controls={active ? POPOVER_ID : undefined}
          aria-expanded={active}
        >
          <span aria-hidden="true">{app.icon}</span>
        </button>;
      })}
    </div>

    {activeApp && <aside
      ref={popoverRef}
      id={POPOVER_ID}
      className="hotspot-popover"
      role="status"
      aria-atomic="true"
      data-window-id={activeApp.id}
      onPointerEnter={handlePointerEnter(activeApp.id)}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
      style={layout ? { left: layout.popoverX, top: layout.popoverY } : { visibility: 'hidden' }}
    >
      <span className="hotspot-popover-icon" aria-hidden="true">{activeApp.icon}</span>
      <strong>{activeApp.label}</strong>
      <small>{activeApp.eyebrow}</small>
    </aside>}

    {activeApp && layout && <svg
      className="hotspot-guide"
      viewBox={`0 0 ${layout.sceneWidth} ${layout.sceneHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-layout-window-id={layoutState?.id}
      data-guide-end-x={layout.guideEndX}
      data-guide-end-y={layout.guideEndY}
    >
      <path className="hotspot-guide-visible" d={layout.path} />
      <path
        className="hotspot-guide-hit"
        d={layout.path}
        onPointerEnter={handlePointerEnter(activeApp.id)}
        onPointerLeave={handlePointerLeave}
      />
    </svg>}
  </div>;
}

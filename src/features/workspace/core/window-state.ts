export type WorkspaceWindowId = 'projects' | 'ai-lab' | 'trading-lab' | 'about';
export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

export type WorkspaceWindowState = {
  id: WorkspaceWindowId;
  open: boolean;
  minimized: boolean;
  zIndex: number;
  position: Point;
};

export type WorkspaceState = {
  windows: Record<WorkspaceWindowId, WorkspaceWindowState>;
  activeId: WorkspaceWindowId | null;
  nextZ: number;
};

export type WorkspaceAction =
  | { type: 'open'; id: WorkspaceWindowId }
  | { type: 'close'; id: WorkspaceWindowId }
  | { type: 'minimize'; id: WorkspaceWindowId }
  | { type: 'focus'; id: WorkspaceWindowId }
  | { type: 'move'; id: WorkspaceWindowId; position: Point }
  | { type: 'reconcile'; id: WorkspaceWindowId | null };

export const WINDOW_IDS: WorkspaceWindowId[] = ['projects', 'ai-lab', 'trading-lab', 'about'];

const INITIAL_POSITIONS: Record<WorkspaceWindowId, Point> = {
  projects: { x: 80, y: 80 },
  'ai-lab': { x: 180, y: 118 },
  'trading-lab': { x: 260, y: 152 },
  about: { x: 340, y: 94 },
};

export function createInitialWorkspaceState(): WorkspaceState {
  return {
    windows: Object.fromEntries(
      WINDOW_IDS.map((id, index) => [id, {
        id,
        open: false,
        minimized: false,
        zIndex: 10 + index,
        position: { ...INITIAL_POSITIONS[id] },
      }]),
    ) as Record<WorkspaceWindowId, WorkspaceWindowState>,
    activeId: null,
    nextZ: 20,
  };
}

export function hashToWindowId(hash: string): WorkspaceWindowId | null {
  const id = hash.replace(/^#/, '') as WorkspaceWindowId;
  return WINDOW_IDS.includes(id) ? id : null;
}

export function clampWindowPosition(position: Point, viewport: Size, windowSize: Size): Point {
  const visibleFromLeft = 120;
  const visibleFromRight = 72;
  const titleBarHeight = 48;
  return {
    x: Math.min(viewport.width - visibleFromRight, Math.max(-(windowSize.width - visibleFromLeft), position.x)),
    y: Math.min(viewport.height - titleBarHeight, Math.max(0, position.y)),
  };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  if (action.type === 'reconcile') {
    const windows = Object.fromEntries(Object.entries(state.windows).map(([id, item]) => [id, {
      ...item, open: action.id === id, minimized: false,
    }])) as Record<WorkspaceWindowId, WorkspaceWindowState>;
    return { ...state, windows, activeId: action.id };
  }
  const current = state.windows[action.id];
  if (!current) return state;

  if (action.type === 'move') {
    return {
      ...state,
      windows: { ...state.windows, [action.id]: { ...current, position: action.position } },
    };
  }

  if (action.type === 'close' || action.type === 'minimize') {
    const windows = {
      ...state.windows,
      [action.id]: { ...current, open: action.type === 'close' ? false : current.open, minimized: action.type === 'minimize' },
    };
    const remaining = Object.values(windows)
      .filter((item) => item.open && !item.minimized && item.id !== action.id)
      .sort((a, b) => b.zIndex - a.zIndex);
    return {
      ...state,
      windows,
      activeId: state.activeId === action.id ? remaining[0]?.id ?? null : state.activeId,
    };
  }

  const nextZ = state.nextZ + 1;
  return {
    ...state,
    windows: {
      ...state.windows,
      [action.id]: {
        ...current,
        open: true,
        minimized: false,
        zIndex: nextZ,
      },
    },
    activeId: action.id,
    nextZ,
  };
}

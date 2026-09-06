import { describe, expect, test } from 'vitest';
import {
  clampWindowPosition,
  createInitialWorkspaceState,
  hashToWindowId,
  workspaceReducer,
} from '../../src/components/workspace/window-state';

describe('workspace window state', () => {
  test('opens a window and brings it to the front', () => {
    const state = createInitialWorkspaceState();
    const next = workspaceReducer(state, { type: 'open', id: 'ai-lab' });
    expect(next.windows['ai-lab']).toMatchObject({ open: true, minimized: false });
    expect(next.activeId).toBe('ai-lab');
  });

  test('minimizes and restores a window without losing its position', () => {
    let state = workspaceReducer(createInitialWorkspaceState(), { type: 'open', id: 'projects' });
    state = workspaceReducer(state, { type: 'move', id: 'projects', position: { x: 240, y: 160 } });
    state = workspaceReducer(state, { type: 'minimize', id: 'projects' });
    state = workspaceReducer(state, { type: 'open', id: 'projects' });
    expect(state.windows.projects.position).toEqual({ x: 240, y: 160 });
    expect(state.windows.projects.minimized).toBe(false);
  });

  test('clamps draggable windows so the title bar remains visible', () => {
    expect(clampWindowPosition({ x: -900, y: -100 }, { width: 1200, height: 800 }, { width: 680, height: 520 }))
      .toEqual({ x: -560, y: 0 });
    expect(clampWindowPosition({ x: 1800, y: 900 }, { width: 1200, height: 800 }, { width: 680, height: 520 }))
      .toEqual({ x: 1128, y: 752 });
  });

  test('maps supported hashes and ignores unrelated hashes', () => {
    expect(hashToWindowId('#trading-lab')).toBe('trading-lab');
    expect(hashToWindowId('#unknown')).toBeNull();
  });
});


test('reconciles history to one visible window and closes all for an empty hash', () => {
  let state = workspaceReducer(createInitialWorkspaceState(), { type: 'open', id: 'projects' });
  state = workspaceReducer(state, { type: 'open', id: 'ai-lab' });
  state = workspaceReducer(state, { type: 'reconcile', id: 'projects' });
  expect(state.windows.projects.open).toBe(true);
  expect(state.windows['ai-lab'].open).toBe(false);
  expect(state.activeId).toBe('projects');
  state = workspaceReducer(state, { type: 'reconcile', id: null });
  expect(Object.values(state.windows).every((item) => !item.open)).toBe(true);
  expect(state.activeId).toBeNull();
});

test('closing the active window promotes the highest remaining window', () => {
  let state = workspaceReducer(createInitialWorkspaceState(), { type: 'open', id: 'projects' });
  state = workspaceReducer(state, { type: 'open', id: 'ai-lab' });
  state = workspaceReducer(state, { type: 'close', id: 'ai-lab' });
  expect(state.activeId).toBe('projects');
});

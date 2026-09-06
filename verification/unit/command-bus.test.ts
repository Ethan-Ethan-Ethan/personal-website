import { describe, expect, test } from 'vitest';
import { createWorkspaceRuntimeState, executeWorkspaceCommand } from '../../src/features/workspace/core/command-bus';

describe('workspace command bus', () => {
  test('previews and resets one shared scene state', () => {
    let runtime = createWorkspaceRuntimeState();
    let output = executeWorkspaceCommand(runtime, { type: 'scene.preview', target: 'ai-lab' });
    expect(output.result).toEqual({ ok: true, command: 'scene.preview' });
    expect(output.state.scene).toBe('ai-lab');
    output = executeWorkspaceCommand(output.state, { type: 'scene.reset' });
    expect(output.state.scene).toBe('idle');
  });

  test('opens a window and emits one history effect', () => {
    const output = executeWorkspaceCommand(createWorkspaceRuntimeState(), { type: 'window.open', id: 'projects', history: 'push' });
    expect(output.state.windows.windows.projects.open).toBe(true);
    expect(output.state.windows.activeId).toBe('projects');
    expect(output.state.scene).toBe('projects');
    expect(output.effects).toEqual([{ type: 'history.push', id: 'projects' }]);
  });

  test('closing the active window promotes the remaining window and replaces history', () => {
    let state = executeWorkspaceCommand(createWorkspaceRuntimeState(), { type: 'window.open', id: 'projects', history: 'push' }).state;
    state = executeWorkspaceCommand(state, { type: 'window.open', id: 'ai-lab', history: 'push' }).state;
    const output = executeWorkspaceCommand(state, { type: 'window.close', id: 'ai-lab' });
    expect(output.state.windows.activeId).toBe('projects');
    expect(output.state.scene).toBe('projects');
    expect(output.effects).toEqual([{ type: 'history.replace', id: 'projects' }]);
  });

  test('fails closed for an unknown runtime command', () => {
    const output = executeWorkspaceCommand(createWorkspaceRuntimeState(), { type: 'scene.explode' } as never);
    expect(output.result).toMatchObject({ ok: false, code: 'unknown-command' });
    expect(output.state).toEqual(createWorkspaceRuntimeState());
  });
});

test('rejects malformed window command payloads before reducer access', () => {
  const state = createWorkspaceRuntimeState();
  expect(executeWorkspaceCommand(state, { type: 'window.open', history: 'push' } as never).result)
    .toMatchObject({ ok: false, code: 'invalid-window-id' });
  expect(executeWorkspaceCommand(state, { type: 'window.open', id: 'projects', history: 'invalid' } as never).result)
    .toMatchObject({ ok: false, code: 'invalid-history-mode' });
  expect(executeWorkspaceCommand(state, { type: 'window.move', id: 'projects', position: undefined } as never).result)
    .toMatchObject({ ok: false, code: 'invalid-window-position' });
});

test('opening the already active window is idempotent and does not push duplicate history', () => {
  const first = executeWorkspaceCommand(createWorkspaceRuntimeState(), { type: 'window.open', id: 'projects', history: 'push' });
  const second = executeWorkspaceCommand(first.state, { type: 'window.open', id: 'projects', history: 'push' });
  expect(second.state).toEqual(first.state);
  expect(second.effects).toEqual([]);
});

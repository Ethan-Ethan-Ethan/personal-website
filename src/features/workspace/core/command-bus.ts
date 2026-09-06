import { SITE_COMMANDS } from '../../../generated/site-system';
import { createInitialWorkspaceState, WINDOW_IDS, workspaceReducer } from './window-state';
import type { CommandOutput, SceneState, WorkspaceCommand, WorkspaceRuntimeState } from './contracts';

const RUNTIME_COMMANDS = new Set<string>(SITE_COMMANDS.filter((name) => name.startsWith('scene.') || name.startsWith('window.')));

export function createWorkspaceRuntimeState(): WorkspaceRuntimeState {
  return { scene: 'idle', windows: createInitialWorkspaceState() };
}

function success(state: WorkspaceRuntimeState, command: WorkspaceCommand['type'], effects: CommandOutput['effects'] = []): CommandOutput {
  return { state, effects, result: { ok: true, command } };
}

function failure(state: WorkspaceRuntimeState, command: string, code: string, message: string): CommandOutput {
  return { state, effects: [], result: { ok: false, command, code, message } };
}

function validScene(target: unknown): target is SceneState {
  return target === 'idle' || WINDOW_IDS.includes(target as never);
}

function validWindowId(id: unknown): id is WorkspaceCommand extends { id: infer T } ? T : never {
  return typeof id === 'string' && WINDOW_IDS.includes(id as never);
}

function validPosition(position: unknown): position is { x: number; y: number } {
  if (!position || typeof position !== 'object') return false;
  const point = position as { x?: unknown; y?: unknown };
  return typeof point.x === 'number' && Number.isFinite(point.x)
    && typeof point.y === 'number' && Number.isFinite(point.y);
}

export function executeWorkspaceCommand(state: WorkspaceRuntimeState, command: WorkspaceCommand): CommandOutput {
  if (!command || typeof command.type !== 'string' || !RUNTIME_COMMANDS.has(command.type)) {
    return failure(state, command?.type ?? 'unknown', 'unknown-command', 'Command is not declared by site-system.yaml');
  }

  if (command.type === 'scene.preview') {
    if (!validScene(command.target)) return failure(state, command.type, 'invalid-scene-target', 'Unknown scene target');
    return success({ ...state, scene: command.target }, command.type);
  }
  if (command.type === 'scene.reset') return success({ ...state, scene: 'idle' }, command.type);

  if (command.type === 'window.reconcile') {
    if (command.id !== null && !validWindowId(command.id)) {
      return failure(state, command.type, 'invalid-window-id', 'Unknown workspace window');
    }
    const windows = workspaceReducer(state.windows, { type: 'reconcile', id: command.id });
    return success({ scene: command.id ?? 'idle', windows }, command.type);
  }

  if (!('id' in command) || !validWindowId(command.id)) {
    return failure(state, command.type, 'invalid-window-id', 'Unknown workspace window');
  }

  if (command.type === 'window.open') {
    if (command.history !== 'push' && command.history !== 'replace') {
      return failure(state, command.type, 'invalid-history-mode', 'History mode must be push or replace');
    }
    const current = state.windows.windows[command.id];
    if (state.windows.activeId === command.id && current.open && !current.minimized) {
      return success(state, command.type);
    }
    const windows = workspaceReducer(state.windows, { type: 'open', id: command.id });
    return success({ scene: command.id, windows }, command.type, [{ type: `history.${command.history}`, id: command.id }]);
  }
  if (command.type === 'window.close' || command.type === 'window.minimize') {
    const windows = workspaceReducer(state.windows, { type: command.type === 'window.close' ? 'close' : 'minimize', id: command.id });
    const scene = windows.activeId ?? 'idle';
    return success({ scene, windows }, command.type, [{ type: 'history.replace', id: windows.activeId }]);
  }
  if (command.type === 'window.focus') {
    const windows = workspaceReducer(state.windows, { type: 'focus', id: command.id });
    return success({ scene: command.id, windows }, command.type, [{ type: 'history.replace', id: command.id }]);
  }
  if (command.type === 'window.move') {
    if (!validPosition(command.position)) {
      return failure(state, command.type, 'invalid-window-position', 'Window position must contain finite x and y coordinates');
    }
    const windows = workspaceReducer(state.windows, { type: 'move', id: command.id, position: command.position });
    return success({ ...state, windows }, command.type);
  }
  return failure(state, command.type, 'unknown-command', 'No runtime handler registered');
}

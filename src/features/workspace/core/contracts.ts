import type { Point, WorkspaceState, WorkspaceWindowId } from './window-state';

export type SceneState = 'idle' | WorkspaceWindowId;
export type HistoryMode = 'push' | 'replace';

export type WorkspaceRuntimeState = {
  scene: SceneState;
  windows: WorkspaceState;
};

export type WorkspaceCommand =
  | { type: 'scene.preview'; target: SceneState }
  | { type: 'scene.reset' }
  | { type: 'window.open'; id: WorkspaceWindowId; history: HistoryMode }
  | { type: 'window.close'; id: WorkspaceWindowId }
  | { type: 'window.minimize'; id: WorkspaceWindowId }
  | { type: 'window.focus'; id: WorkspaceWindowId }
  | { type: 'window.move'; id: WorkspaceWindowId; position: Point }
  | { type: 'window.reconcile'; id: WorkspaceWindowId | null };

export type WorkspaceEffect =
  | { type: 'history.push'; id: WorkspaceWindowId }
  | { type: 'history.replace'; id: WorkspaceWindowId | null };

export type CommandResult =
  | { ok: true; command: WorkspaceCommand['type'] }
  | { ok: false; command: string; code: string; message: string };

export type CommandOutput = {
  state: WorkspaceRuntimeState;
  effects: WorkspaceEffect[];
  result: CommandResult;
};

export type PublicContent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  section: 'projects' | 'ai-lab' | 'trading-lab' | 'about';
  status: 'active' | 'completed' | 'research' | 'paused';
  updatedAt: string;
  lastReviewed: string;
  featured: boolean;
  order: number;
  tags: string[];
  highlights: string[];
  demoUrl?: string;
  repoUrl?: string;
  evidence?: { date: string; scope: string; disclaimer: string; liveSignal: false };
};

export type ArticleLink = { title: string; href: string; category?: string };
export type WorkspaceApp = { id: WorkspaceWindowId; label: string; eyebrow: string; icon: string };

export const WORKSPACE_APPS: WorkspaceApp[] = [
  { id: 'projects', label: 'Projects', eyebrow: 'Selected work', icon: '✦' },
  { id: 'ai-lab', label: 'AI Lab', eyebrow: 'Systems & agents', icon: '⌘' },
  { id: 'trading-lab', label: 'Trading Lab', eyebrow: 'Research only', icon: '⌁' },
  { id: 'about', label: 'About', eyebrow: 'Profile & contact', icon: '◎' },
];

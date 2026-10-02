// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import WorkspaceDesktop from '../../src/components/workspace/WorkspaceDesktop';
import ComputerHotspots from '../../src/features/workspace/elements/ComputerHotspots';
import WorkspaceDock from '../../src/features/workspace/windows/WorkspaceDock';
import { createInitialWorkspaceState } from '../../src/features/workspace/core/window-state';

const content = [
  {
    id: 'demo', slug: 'demo', title: 'Demo Project', summary: 'A safe summary.',
    section: 'projects', status: 'active', updatedAt: '2026-09-05', lastReviewed: '2026-09-05',
    featured: true, order: 1, tags: ['domain/ai-dev'], highlights: ['Verified output'],
  },
  {
    id: 'lab', slug: 'lab', title: 'AI Lab Item', summary: 'A lab summary.',
    section: 'ai-lab', status: 'research', updatedAt: '2026-09-05', lastReviewed: '2026-09-05',
    featured: true, order: 2, tags: [], highlights: [],
  },
];

const MOBILE_MEDIA_QUERY = '(max-width: 520px), (min-width: 521px) and (max-width: 767px) and (pointer: coarse)';

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query === MOBILE_MEDIA_QUERY,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

describe('WorkspaceDesktop', () => {
  test('opens an accessible projects window from a shared hash', () => {
    window.history.replaceState(null, '', '/#projects');
    render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
    expect(screen.getByRole('dialog', { name: /projects/i })).toBeTruthy();
    expect(screen.getByText('Demo Project')).toBeTruthy();
  });

  test('Escape closes the active window and clears its hash', () => {
    window.history.replaceState(null, '', '/#ai-lab');
    render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
    expect(window.location.hash).toBe('#ai-lab');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /ai lab/i })).toBeNull();
    expect(window.location.hash).toBe('');
  });

  test('opens a shared hash on initial render', () => {
    window.history.replaceState(null, '', '/#about');
    render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
    expect(screen.getByRole('dialog', { name: /about/i })).toBeTruthy();
  });
});


test('moves focus into the opened window and restores it to the launcher', async () => {
  window.history.replaceState(null, '', '/#projects');
  render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const launcher = screen.getByRole('button', { name: 'Preview Projects from monitor' });
  const dialog = screen.getByRole('dialog', { name: /projects/i });
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  fireEvent.click(screen.getByRole('button', { name: /close projects/i }));
  await waitFor(() => expect(document.activeElement).toBe(launcher));
});

test('reopening the active window from the dock preserves state and returns focus to the dialog', async () => {
  window.history.replaceState(null, '', '/#projects');
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const dialog = screen.getByRole('dialog', { name: /projects/i });
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  const zIndex = dialog.style.zIndex;
  const historyLength = window.history.length;
  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  const dockLauncher = within(dock).getByRole('button', { name: /projects/i });
  dockLauncher.focus();
  fireEvent.click(dockLauncher);
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  expect(dialog.style.zIndex).toBe(zIndex);
  expect(window.history.length).toBe(historyLength);
  expect(window.location.hash).toBe('#projects');
});

test('a hidden dock is removed from accessibility and tab navigation', () => {
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  expect(dock.getAttribute('aria-hidden')).toBe('true');
  expect(dock.hasAttribute('inert')).toBe(true);
  for (const button of within(dock).getAllByRole('button', { hidden: true })) {
    expect(button.tabIndex).toBe(-1);
  }
});

test('using the dock does not replace the scene launcher used for focus restoration', async () => {
  window.history.replaceState(null, '', '/#projects');
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const monitor = container.querySelector('.monitor-screen') as HTMLElement;
  const sceneLauncher = within(monitor).getByRole('button', { name: 'Preview Projects from monitor' });
  const dialog = screen.getByRole('dialog', { name: /projects/i });
  await waitFor(() => expect(document.activeElement).toBe(dialog));

  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  const dockLauncher = within(dock).getByRole('button', { name: /projects/i });
  dockLauncher.focus();
  fireEvent.click(dockLauncher);
  fireEvent.click(within(dialog).getByRole('button', { name: /close projects/i }));

  await waitFor(() => expect(document.activeElement).toBe(sceneLauncher));
  expect(dock.getAttribute('aria-hidden')).toBe('true');
});

test('dock activation reports only the window id and never claims launcher ownership', () => {
  const onOpen = vi.fn();
  render(React.createElement(WorkspaceDock, {
    state: createInitialWorkspaceState(),
    visible: true,
    blocked: false,
    onOpen,
  }));
  fireEvent.click(screen.getByRole('button', { name: /projects/i }));
  expect(onOpen).toHaveBeenCalledWith('projects');
});

test('mobile modal state makes the scene, dock, and inactive dialogs non-interactive', async () => {
  setMobileViewport();
  window.history.replaceState(null, '', '/#projects');
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const projects = screen.getByRole('dialog', { name: /projects/i });
  await waitFor(() => expect(projects.getAttribute('aria-modal')).toBe('true'));

  const sceneGuard = container.querySelector('.workspace-scene-guard') as HTMLElement;
  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  expect(sceneGuard.hasAttribute('inert')).toBe(true);
  expect(sceneGuard.getAttribute('aria-hidden')).toBe('true');
  expect(dock.hasAttribute('inert')).toBe(true);
  expect(dock.getAttribute('aria-hidden')).toBe('true');
  for (const button of within(dock).getAllByRole('button', { hidden: true })) {
    expect(button.tabIndex).toBe(-1);
  }

  expect(projects.hasAttribute('inert')).toBe(false);
});

test('desktop keeps background windows available for multi-window focus', async () => {
  window.history.replaceState(null, '', '/#projects');
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  fireEvent.click(within(dock).getByRole('button', { name: /ai lab/i }));
  const projects = screen.getByRole('dialog', { name: /projects/i });
  expect(projects.hasAttribute('inert')).toBe(false);
  expect(projects.getAttribute('aria-hidden')).toBeNull();
  expect(projects.getAttribute('aria-modal')).toBe('false');
});

test('server-rendered preview controls are disabled until hydration', () => {
  const html = renderToString(React.createElement(ComputerHotspots, {
    registerLauncher: () => {},
  }));
  const shell = document.createElement('div');
  shell.innerHTML = html;
  expect(shell.querySelectorAll('[data-trigger-source="hotspot"]')).toHaveLength(4);
  expect(shell.querySelectorAll('[data-trigger-source="bottom-link"]')).toHaveLength(4);
  const buttons = Array.from(shell.querySelectorAll<HTMLButtonElement>(
    '[data-trigger-source="hotspot"],[data-trigger-source="bottom-link"]',
  ));
  expect(buttons).toHaveLength(8);
  expect(buttons.every((button) => button.disabled)).toBe(true);
});

test('history reconciliation that closes the final window restores focus to its launcher', async () => {
  window.history.replaceState(null, '', '/#projects');
  render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const launcher = screen.getByRole('button', { name: 'Preview Projects from monitor' });
  const dialog = screen.getByRole('dialog', { name: /projects/i });
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  window.history.replaceState(null, '', '/');
  fireEvent(window, new PopStateEvent('popstate'));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: /projects/i })).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(launcher));
});

test('keyboard focus entering a background dialog promotes it without moving focus off the control', async () => {
  window.history.replaceState(null, '', '/#projects');
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const dock = container.querySelector('.workspace-dock') as HTMLElement;
  fireEvent.click(within(dock).getByRole('button', { name: /ai lab/i }));
  const projectsDialog = screen.getByRole('dialog', { name: /projects/i });
  const aiDialog = screen.getByRole('dialog', { name: /ai lab/i });
  const projectsClose = within(projectsDialog).getByRole('button', { name: /close projects/i });
  projectsClose.focus();
  await waitFor(() => expect(Number(projectsDialog.style.zIndex)).toBeGreaterThan(Number(aiDialog.style.zIndex)));
  expect(document.activeElement).toBe(projectsClose);
  expect(window.location.hash).toBe('#projects');
});

test('does not load a third-party trading iframe before explicit consent', () => {
  window.history.replaceState(null, '', '/#trading-lab');
  render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  expect(screen.queryByTitle(/market overview/i)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /load tradingview/i }));
  expect(screen.getByTitle(/market overview/i)).toBeTruthy();
});


test('renders visible ambient motion layers independently of WebGL', () => {
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  expect(container.querySelector('.visible-starfield')).not.toBeNull();
  expect(container.querySelectorAll('.visible-starfield i')).toHaveLength(12);
  expect(container.querySelector('.shooting-star')).not.toBeNull();
});


test('keeps hotspot preview local without changing scene hash or windows', () => {
  const { container } = render(React.createElement(WorkspaceDesktop, { content: content as any, recentArticles: [] }));
  const root = container.querySelector('.workspace-page');
  const aiButton = screen.getByRole('button', { name: 'Preview AI Lab from monitor' });
  expect(root?.getAttribute('data-scene-state')).toBe('idle');
  fireEvent.pointerEnter(aiButton);
  expect(screen.getByRole('status').textContent).toContain('AI Lab');
  expect(root?.getAttribute('data-scene-state')).toBe('idle');
  fireEvent.click(aiButton);
  expect(window.location.hash).toBe('');
  expect(screen.queryByRole('dialog', { name: /ai lab/i })).toBeNull();
});


test('uses an ordered smoothstep expression for the inverse nebula glow', () => {
  const source = readFileSync('src/features/workspace/elements/GalaxyCanvas.tsx', 'utf8');
  expect(source).toContain('1.0 - smoothstep(.18,.62,length(uv*vec2(.72,1.)))');
  expect(source).not.toContain('smoothstep(.62,.18');
});

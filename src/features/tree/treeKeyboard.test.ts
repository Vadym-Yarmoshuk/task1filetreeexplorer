import { describe, expect, it } from 'vitest';
import { buildIndex } from '../../domain/buildIndex';
import { flattenVisible } from '../../domain/flattenVisible';
import type { FolderNode } from '../../domain/types';
import { getTreeKeyAction } from './treeKeyboard';

const TREE: FolderNode = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'index.ts', type: 'file', size: 1 },
        { name: 'utils', type: 'folder', children: [] },
      ],
    },
    { name: 'docs', type: 'folder', children: [{ name: 'a.md', type: 'file', size: 1 }] },
    { name: 'package.json', type: 'file', size: 1 },
  ],
};
const index = buildIndex(TREE);

/**
 * Runs a key press against the tree with the given expanded folders and focus.
 * @param key - Pressed key.
 * @param expandedPaths - Paths of expanded folders.
 * @param focusedPath - Path of the focused node.
 * @returns The resulting action.
 */
function press(key: string, expandedPaths: string[], focusedPath: string) {
  const expanded = new Set(expandedPaths);
  const rows = flattenVisible(index, expanded);
  const focusedRow = rows.findIndex((node) => node.path === focusedPath);
  return getTreeKeyAction(key, { rows, index, expanded, focusedRow });
}

describe('getTreeKeyAction', () => {
  // Visible rows with root and src expanded:
  // root, src, src/index.ts, src/utils, docs, package.json
  const open = ['', 'src'];

  it('moves focus down and up', () => {
    expect(press('ArrowDown', open, 'src')).toEqual({ type: 'focus', path: 'src/index.ts' });
    expect(press('ArrowUp', open, 'docs')).toEqual({ type: 'focus', path: 'src/utils' });
  });

  it('does nothing at the start and end of the list', () => {
    expect(press('ArrowUp', open, '')).toBeNull();
    expect(press('ArrowDown', open, 'package.json')).toBeNull();
  });

  it('moves focus to the first and last row', () => {
    expect(press('Home', open, 'docs')).toEqual({ type: 'focus', path: '' });
    expect(press('End', open, 'src')).toEqual({ type: 'focus', path: 'package.json' });
  });

  it('expands a collapsed folder with ArrowRight', () => {
    expect(press('ArrowRight', open, 'docs')).toEqual({ type: 'expand', paths: ['docs'] });
  });

  it('moves to the first child of an expanded folder with ArrowRight', () => {
    expect(press('ArrowRight', open, 'src')).toEqual({ type: 'focus', path: 'src/index.ts' });
  });

  it('does nothing with ArrowRight on a file or an empty expanded folder', () => {
    expect(press('ArrowRight', open, 'package.json')).toBeNull();
    expect(press('ArrowRight', [...open, 'src/utils'], 'src/utils')).toBeNull();
  });

  it('collapses an expanded folder with ArrowLeft', () => {
    expect(press('ArrowLeft', open, 'src')).toEqual({ type: 'collapse', path: 'src' });
  });

  it('moves to the parent with ArrowLeft on a file or a collapsed folder', () => {
    expect(press('ArrowLeft', open, 'src/index.ts')).toEqual({ type: 'focus', path: 'src' });
    expect(press('ArrowLeft', open, 'docs')).toEqual({ type: 'focus', path: '' });
  });

  it('does nothing with ArrowLeft on a collapsed root', () => {
    expect(press('ArrowLeft', [], '')).toBeNull();
  });

  it('opens a node with Enter', () => {
    expect(press('Enter', open, 'package.json')).toEqual({ type: 'open', path: 'package.json' });
  });

  it('toggles a folder with Space and ignores Space on a file', () => {
    expect(press(' ', open, 'docs')).toEqual({ type: 'toggle', path: 'docs' });
    expect(press(' ', open, 'package.json')).toBeNull();
  });

  it('expands all sibling folders with *', () => {
    expect(press('*', open, 'package.json')).toEqual({ type: 'expand', paths: ['src', 'docs'] });
    expect(press('*', [], '')).toEqual({ type: 'expand', paths: [''] });
  });

  it('returns null for * when there are no sibling folders', () => {
    expect(press('*', open, 'src/index.ts')).toEqual({ type: 'expand', paths: ['src/utils'] });
    expect(press('*', [...open, 'docs'], 'docs/a.md')).toBeNull();
  });

  it('jumps to the next name that starts with the typed letter and wraps around', () => {
    expect(press('d', open, '')).toEqual({ type: 'focus', path: 'docs' });
    expect(press('S', open, 'docs')).toEqual({ type: 'focus', path: 'src' });
    expect(press('x', open, '')).toBeNull();
  });

  it('ignores other keys and a missing focused row', () => {
    expect(press('Tab', open, '')).toBeNull();
    expect(
      getTreeKeyAction('ArrowDown', { rows: [], index, expanded: new Set(), focusedRow: 0 }),
    ).toBeNull();
  });
});

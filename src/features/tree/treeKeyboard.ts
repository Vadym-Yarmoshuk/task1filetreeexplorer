import type { IndexedNode, TreeIndex } from '../../domain/types';

/** Data needed to decide what a key press does. */
export interface TreeKeyContext {
  /** Visible rows in display order. */
  rows: readonly IndexedNode[];
  /** Tree index, to find parents and siblings. */
  index: TreeIndex;
  /** Paths of expanded folders. */
  expanded: ReadonlySet<string>;
  /** Row index of the focused node. */
  focusedRow: number;
}

/** What the tree must do after a key press. */
export type TreeKeyAction =
  | { type: 'focus'; path: string }
  | { type: 'expand'; paths: string[] }
  | { type: 'collapse'; path: string }
  | { type: 'toggle'; path: string }
  | { type: 'open'; path: string };

/**
 * Maps a key press in the tree to an action, following the WAI-ARIA Tree View pattern.
 * @param key - Value of KeyboardEvent.key.
 * @param context - Visible rows, index, expanded folders and the focused row.
 * @returns The action, or null if the key does nothing.
 */
export function getTreeKeyAction(key: string, context: TreeKeyContext): TreeKeyAction | null {
  const { rows, index, expanded, focusedRow } = context;
  const node = rows[focusedRow];
  if (!node) {
    return null;
  }
  const isFolder = node.type === 'folder';
  const isExpanded = isFolder && expanded.has(node.path);

  switch (key) {
    case 'ArrowDown':
      return focusRow(rows, focusedRow + 1);
    case 'ArrowUp':
      return focusRow(rows, focusedRow - 1);
    case 'Home':
      return focusRow(rows, 0);
    case 'End':
      return focusRow(rows, rows.length - 1);
    case 'ArrowRight':
      if (!isFolder) {
        return null;
      }
      if (!isExpanded) {
        return { type: 'expand', paths: [node.path] };
      }
      return node.childPaths[0] === undefined ? null : { type: 'focus', path: node.childPaths[0] };
    case 'ArrowLeft':
      if (isExpanded) {
        return { type: 'collapse', path: node.path };
      }
      return node.parentPath === null ? null : { type: 'focus', path: node.parentPath };
    case 'Enter':
      return { type: 'open', path: node.path };
    case ' ':
      return isFolder ? { type: 'toggle', path: node.path } : null;
    case '*':
      return expandSiblings(index, node);
    default:
      return key.length === 1 ? findByFirstLetter(rows, focusedRow, key) : null;
  }
}

/**
 * Creates a focus action for a row, if the row exists.
 * @param rows - Visible rows.
 * @param rowIndex - Row to focus.
 * @returns The focus action, or null outside the list.
 */
function focusRow(rows: readonly IndexedNode[], rowIndex: number): TreeKeyAction | null {
  const target = rows[rowIndex];
  return target ? { type: 'focus', path: target.path } : null;
}

/**
 * Creates an action that expands all folders on the same level as the node.
 * @param index - Tree index.
 * @param node - Focused node.
 * @returns The expand action, or null if there are no sibling folders.
 */
function expandSiblings(index: TreeIndex, node: IndexedNode): TreeKeyAction | null {
  const siblings =
    node.parentPath === null ? [node.path] : index.nodes.get(node.parentPath)!.childPaths;
  const folders = siblings.filter((path) => index.nodes.get(path)!.type === 'folder');
  return folders.length > 0 ? { type: 'expand', paths: folders } : null;
}

/**
 * Finds the next visible node whose name starts with the letter (type-ahead).
 * Searches after the focused row and wraps around to the top.
 * @param rows - Visible rows.
 * @param focusedRow - Row index of the focused node.
 * @param letter - Typed character.
 * @returns The focus action, or null if no name starts with the letter.
 */
function findByFirstLetter(
  rows: readonly IndexedNode[],
  focusedRow: number,
  letter: string,
): TreeKeyAction | null {
  const needle = letter.toLocaleLowerCase();
  for (let offset = 1; offset <= rows.length; offset++) {
    const candidate = rows[(focusedRow + offset) % rows.length]!;
    if (candidate.name.toLocaleLowerCase().startsWith(needle)) {
      return { type: 'focus', path: candidate.path };
    }
  }
  return null;
}

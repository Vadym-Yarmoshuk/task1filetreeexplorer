import type { IndexedNode, TreeIndex } from './types';

/**
 * Lists the nodes that are visible in the tree view, in display order (pre-order).
 * The root is always visible. Children of a collapsed folder are skipped.
 * @param index - Tree index.
 * @param expanded - Paths of expanded folders.
 * @returns Visible nodes, ready for a virtualized list.
 */
export function flattenVisible(index: TreeIndex, expanded: ReadonlySet<string>): IndexedNode[] {
  const visible: IndexedNode[] = [];
  const stack: IndexedNode[] = [index.root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    visible.push(node);
    if (node.type === 'folder' && expanded.has(node.path)) {
      for (let i = node.childPaths.length - 1; i >= 0; i--) {
        stack.push(index.nodes.get(node.childPaths[i]!)!);
      }
    }
  }

  return visible;
}

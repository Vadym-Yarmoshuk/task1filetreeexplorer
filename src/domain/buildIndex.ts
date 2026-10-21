import { joinPath, ROOT_PATH } from './paths';
import type { FolderNode, IndexedNode, TreeIndex, TreeNode } from './types';

/** One node waiting to be indexed. */
interface PendingNode {
  node: TreeNode;
  path: string;
  parentPath: string | null;
  depth: number;
  position: number;
}

/**
 * Builds a lookup index from a validated tree and computes folder sizes.
 * Uses an explicit stack, so any nesting depth works.
 * @param tree - Validated root folder.
 * @returns The index with all nodes in pre-order.
 */
export function buildIndex(tree: FolderNode): TreeIndex {
  const nodes = new Map<string, IndexedNode>();
  const stack: PendingNode[] = [
    { node: tree, path: ROOT_PATH, parentPath: null, depth: 0, position: 0 },
  ];

  while (stack.length > 0) {
    const { node, path, parentPath, depth, position } = stack.pop()!;
    const childPaths =
      node.type === 'folder' ? node.children.map((c) => joinPath(path, c.name)) : [];

    nodes.set(path, {
      name: node.name,
      type: node.type,
      path,
      parentPath,
      depth,
      position,
      childPaths,
      size: node.type === 'file' ? node.size : 0,
    });

    if (node.type === 'folder') {
      // Push in reverse order, so the map keeps the input order of children.
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          node: node.children[i]!,
          path: childPaths[i]!,
          parentPath: path,
          depth: depth + 1,
          position: i,
        });
      }
    }
  }

  // In reverse pre-order every node comes after all its descendants,
  // so its size is final before it is added to the parent.
  const ordered = [...nodes.values()];
  for (let i = ordered.length - 1; i > 0; i--) {
    const node = ordered[i]!;
    nodes.get(node.parentPath!)!.size += node.size;
  }

  return { root: nodes.get(ROOT_PATH)!, nodes };
}

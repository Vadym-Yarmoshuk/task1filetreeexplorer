import type { FileNode, FolderNode } from './types';

/** Shape of a generated tree. */
export interface GenerateTreeOptions {
  /** Number of folder levels below the root. */
  depth: number;
  /** Number of subfolders in each folder (except the deepest level). */
  foldersPerFolder: number;
  /** Number of files in each folder. */
  filesPerFolder: number;
}

/**
 * Generates a synthetic tree for performance tests and demos.
 * File sizes are deterministic, so the same options always give the same tree.
 * @param options - Shape of the tree.
 * @returns The generated root folder.
 */
export function generateTree({
  depth,
  foldersPerFolder,
  filesPerFolder,
}: GenerateTreeOptions): FolderNode {
  const root: FolderNode = { name: 'root', type: 'folder', children: [] };
  const stack: { folder: FolderNode; level: number }[] = [{ folder: root, level: 0 }];
  let fileCounter = 0;

  while (stack.length > 0) {
    const { folder, level } = stack.pop()!;
    if (level < depth) {
      for (let i = 0; i < foldersPerFolder; i++) {
        const child: FolderNode = {
          name: `folder-${level + 1}-${i}`,
          type: 'folder',
          children: [],
        };
        folder.children.push(child);
        stack.push({ folder: child, level: level + 1 });
      }
    }
    for (let i = 0; i < filesPerFolder; i++) {
      fileCounter++;
      const file: FileNode = {
        name: `file-${fileCounter}.txt`,
        type: 'file',
        size: (fileCounter * 7919) % 2_000_000,
      };
      folder.children.push(file);
    }
  }

  return root;
}

/**
 * Counts the nodes a generated tree will have, without generating it.
 * @param options - Shape of the tree.
 * @returns Total number of nodes, including the root.
 */
export function countGeneratedNodes({
  depth,
  foldersPerFolder,
  filesPerFolder,
}: GenerateTreeOptions): number {
  let folders = 0;
  let levelSize = 1;
  for (let level = 0; level <= depth; level++) {
    folders += levelSize;
    levelSize *= foldersPerFolder;
  }
  return folders * (1 + filesPerFolder);
}

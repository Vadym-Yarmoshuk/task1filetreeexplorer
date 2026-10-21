/** File node from the input JSON. */
export interface FileNode {
  name: string;
  type: 'file';
  /** File size in bytes. */
  size: number;
}

/** Folder node from the input JSON. */
export interface FolderNode {
  name: string;
  type: 'folder';
  children: TreeNode[];
}

/** Any node from the input JSON. */
export type TreeNode = FileNode | FolderNode;

/** Node type: file or folder. */
export type NodeType = TreeNode['type'];

/** Node with precomputed data for fast lookup. */
export interface IndexedNode {
  name: string;
  type: NodeType;
  /** Path from the root, without the root name, for example "src/index.ts". The root has "". */
  path: string;
  /** Path of the parent folder. The root has null. */
  parentPath: string | null;
  /** Nesting level. The root has 0. */
  depth: number;
  /** Index among the siblings, starting at 0. The root has 0. */
  position: number;
  /** Paths of direct children, in input order. Empty for a file. */
  childPaths: string[];
  /** File size in bytes, or the total size of all files in the subtree for a folder. */
  size: number;
}

/** Lookup structure built once from a validated tree. */
export interface TreeIndex {
  /** The root node. */
  root: IndexedNode;
  /** All nodes by path, in pre-order (a parent comes before its children). */
  nodes: ReadonlyMap<string, IndexedNode>;
}

import { createContext } from 'react';
import type { TreeParseError } from '../domain/parseTree';
import type { TreeIndex } from '../domain/types';

/** Result of loading a tree from JSON text. */
export type LoadTreeResult =
  | { ok: true; /** False if the tree did not fit in localStorage. */ persisted: boolean }
  | { ok: false; error: TreeParseError };

/** Value of {@link TreeDataContext}. */
export interface TreeDataContextValue {
  /** Index of the loaded tree, or null if no tree is loaded. */
  index: TreeIndex | null;
  /** True if the loaded tree is saved and survives a page refresh. */
  isPersisted: boolean;
  /** Parses, validates and loads a tree. Keeps the current tree if the text is not valid. */
  loadTree: (text: string) => LoadTreeResult;
  /** Removes the loaded tree from memory and storage. */
  clearTree: () => void;
}

/** Shares the loaded tree with all views. */
export const TreeDataContext = createContext<TreeDataContextValue | null>(null);

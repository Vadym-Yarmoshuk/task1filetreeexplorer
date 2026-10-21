import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAncestorPaths, ROOT_PATH } from '../../domain/paths';
import type { TreeIndex } from '../../domain/types';
import { loadExpandedPaths, saveExpandedPaths } from '../../store/expandedStorage';

/** Expanded folders and the functions that change them. */
export interface ExpandedState {
  /** Paths of expanded folders. */
  expanded: ReadonlySet<string>;
  /** Expands a collapsed folder or collapses an expanded one. */
  toggle: (path: string) => void;
  /** Expands the given folders. */
  expand: (paths: readonly string[]) => void;
  /** Collapses one folder. */
  collapse: (path: string) => void;
  /** Expands every folder in the tree. */
  expandAll: () => void;
  /** Collapses every folder except the root. */
  collapseAll: () => void;
}

/**
 * Restores expanded folders from sessionStorage. Ignores paths that are not folders in this tree.
 * Also expands all ancestors of the node to reveal, so it is visible.
 * @param index - Tree index.
 * @param revealPath - Path of a node that must be visible.
 * @returns Expanded paths. By default only the root is expanded.
 */
function restoreExpanded(index: TreeIndex, revealPath: string): ReadonlySet<string> {
  const saved = loadExpandedPaths() ?? [ROOT_PATH];
  const expanded = new Set(saved.filter((path) => index.nodes.get(path)?.type === 'folder'));
  for (const ancestor of getAncestorPaths(revealPath)) {
    expanded.add(ancestor);
  }
  return expanded;
}

/**
 * Keeps the set of expanded folders and saves it in sessionStorage, so it survives a refresh.
 * @param index - Tree index.
 * @param revealPath - Path of a node that must be visible on the first render.
 * @returns The expanded folders and functions to change them.
 */
export function useExpandedState(index: TreeIndex, revealPath: string = ROOT_PATH): ExpandedState {
  const [expanded, setExpanded] = useState(() => restoreExpanded(index, revealPath));

  useEffect(() => {
    saveExpandedPaths(expanded);
  }, [expanded]);

  const toggle = useCallback((path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(path)) {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expand = useCallback((paths: readonly string[]) => {
    setExpanded((current) => {
      if (paths.every((path) => current.has(path))) {
        return current;
      }
      return new Set([...current, ...paths]);
    });
  }, []);

  const collapse = useCallback((path: string) => {
    setExpanded((current) => {
      if (!current.has(path)) {
        return current;
      }
      const next = new Set(current);
      next.delete(path);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const folders = new Set<string>();
    for (const node of index.nodes.values()) {
      if (node.type === 'folder') {
        folders.add(node.path);
      }
    }
    setExpanded(folders);
  }, [index]);

  const collapseAll = useCallback(() => setExpanded(new Set([ROOT_PATH])), []);

  return useMemo(
    () => ({ expanded, toggle, expand, collapse, expandAll, collapseAll }),
    [expanded, toggle, expand, collapse, expandAll, collapseAll],
  );
}

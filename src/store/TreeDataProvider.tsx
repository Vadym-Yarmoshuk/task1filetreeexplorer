import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { buildIndex } from '../domain/buildIndex';
import { parseTreeJson } from '../domain/parseTree';
import type { TreeIndex } from '../domain/types';
import { TreeDataContext, type LoadTreeResult, type TreeDataContextValue } from './TreeDataContext';
import { clearExpandedPaths } from './expandedStorage';
import { clearTreeText, loadTreeText, saveTreeText } from './treeStorage';

/** Props for {@link TreeDataProvider}. */
interface TreeDataProviderProps {
  children: ReactNode;
}

/** Internal state of the provider. */
interface TreeState {
  index: TreeIndex | null;
  isPersisted: boolean;
}

/**
 * Restores the tree saved in localStorage. Removes saved data that is no longer valid.
 * @returns The restored state, or an empty state.
 */
function restoreState(): TreeState {
  const text = loadTreeText();
  if (text === null) {
    return { index: null, isPersisted: false };
  }
  const result = parseTreeJson(text);
  if (!result.ok) {
    clearTreeText();
    return { index: null, isPersisted: false };
  }
  return { index: buildIndex(result.tree), isPersisted: true };
}

/**
 * Keeps the loaded tree in memory and in localStorage, so it survives a page refresh.
 * @param props - Component props.
 * @returns The context provider.
 */
export function TreeDataProvider({ children }: TreeDataProviderProps) {
  const [state, setState] = useState<TreeState>(restoreState);

  const loadTree = useCallback((text: string): LoadTreeResult => {
    const result = parseTreeJson(text);
    if (!result.ok) {
      return result;
    }
    const index = buildIndex(result.tree);
    const persisted = saveTreeText(text);
    clearExpandedPaths();
    setState({ index, isPersisted: persisted });
    return { ok: true, persisted };
  }, []);

  const clearTree = useCallback(() => {
    clearTreeText();
    clearExpandedPaths();
    setState({ index: null, isPersisted: false });
  }, []);

  const value = useMemo<TreeDataContextValue>(
    () => ({ index: state.index, isPersisted: state.isPersisted, loadTree, clearTree }),
    [state, loadTree, clearTree],
  );

  return <TreeDataContext.Provider value={value}>{children}</TreeDataContext.Provider>;
}

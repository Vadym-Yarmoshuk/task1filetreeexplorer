import { useContext } from 'react';
import { TreeDataContext, type TreeDataContextValue } from './TreeDataContext';

/**
 * Gives access to the loaded tree and the functions that change it.
 * @returns The tree data context value.
 * @throws {Error} If used outside TreeDataProvider.
 */
export function useTreeData(): TreeDataContextValue {
  const value = useContext(TreeDataContext);
  if (!value) {
    throw new Error('useTreeData must be used inside TreeDataProvider');
  }
  return value;
}

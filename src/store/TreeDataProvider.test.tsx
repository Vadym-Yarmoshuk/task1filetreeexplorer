import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_TREE } from '../domain/sampleTree';
import { TREE_STORAGE_KEY } from './treeStorage';
import { TreeDataProvider } from './TreeDataProvider';
import { useTreeData } from './useTreeData';

/**
 * Renders the useTreeData hook inside the provider.
 * @returns The hook result.
 */
function renderTreeData() {
  return renderHook(() => useTreeData(), { wrapper: TreeDataProvider });
}

describe('TreeDataProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts empty when nothing is saved', () => {
    const { result } = renderTreeData();
    expect(result.current.index).toBeNull();
    expect(result.current.isPersisted).toBe(false);
  });

  it('loads a valid tree and saves the raw text', () => {
    const { result } = renderTreeData();
    const text = JSON.stringify(SAMPLE_TREE);
    let loadResult;
    act(() => {
      loadResult = result.current.loadTree(text);
    });
    expect(loadResult).toEqual({ ok: true, persisted: true });
    expect(result.current.index?.root.name).toBe('root');
    expect(result.current.isPersisted).toBe(true);
    expect(localStorage.getItem(TREE_STORAGE_KEY)).toBe(text);
  });

  it('keeps the current tree when new text is not valid', () => {
    const { result } = renderTreeData();
    act(() => {
      result.current.loadTree(JSON.stringify(SAMPLE_TREE));
    });
    let loadResult;
    act(() => {
      loadResult = result.current.loadTree('{');
    });
    expect(loadResult).toMatchObject({ ok: false });
    expect(result.current.index?.nodes.size).toBe(6);
  });

  it('restores a saved tree after a refresh', () => {
    localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(SAMPLE_TREE));
    const { result } = renderTreeData();
    expect(result.current.index?.nodes.has('src/components/Button.tsx')).toBe(true);
    expect(result.current.isPersisted).toBe(true);
  });

  it('removes saved data that is no longer valid', () => {
    localStorage.setItem(TREE_STORAGE_KEY, '{"broken":');
    const { result } = renderTreeData();
    expect(result.current.index).toBeNull();
    expect(localStorage.getItem(TREE_STORAGE_KEY)).toBeNull();
  });

  it('keeps the tree in memory when storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const { result } = renderTreeData();
    act(() => {
      result.current.loadTree(JSON.stringify(SAMPLE_TREE));
    });
    expect(result.current.index).not.toBeNull();
    expect(result.current.isPersisted).toBe(false);
  });

  it('clears the tree from memory and storage', () => {
    localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(SAMPLE_TREE));
    const { result } = renderTreeData();
    act(() => {
      result.current.clearTree();
    });
    expect(result.current.index).toBeNull();
    expect(localStorage.getItem(TREE_STORAGE_KEY)).toBeNull();
  });

  it('throws a clear error when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    /**
     * Calls the hook without a provider.
     * @returns Nothing.
     */
    function Orphan() {
      useTreeData();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/TreeDataProvider/);
    expect(screen.queryByText('anything')).toBeNull();
  });
});

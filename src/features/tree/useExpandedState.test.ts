import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildIndex } from '../../domain/buildIndex';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import { EXPANDED_STORAGE_KEY } from '../../store/expandedStorage';
import { useExpandedState } from './useExpandedState';

const index = buildIndex(SAMPLE_TREE);

/**
 * Lists expanded paths in a stable order.
 * @param expanded - Expanded paths.
 * @returns Sorted paths.
 */
function sorted(expanded: ReadonlySet<string>): string[] {
  return [...expanded].sort();
}

describe('useExpandedState', () => {
  it('expands only the root by default', () => {
    const { result } = renderHook(() => useExpandedState(index));
    expect(sorted(result.current.expanded)).toEqual(['']);
  });

  it('toggles, expands and collapses folders', () => {
    const { result } = renderHook(() => useExpandedState(index));
    act(() => result.current.toggle('src'));
    expect(result.current.expanded.has('src')).toBe(true);
    act(() => result.current.toggle('src'));
    expect(result.current.expanded.has('src')).toBe(false);
    act(() => result.current.expand(['src', 'src/components']));
    expect(sorted(result.current.expanded)).toEqual(['', 'src', 'src/components']);
    act(() => result.current.collapse('src'));
    expect(sorted(result.current.expanded)).toEqual(['', 'src/components']);
  });

  it('keeps the same set when nothing changes', () => {
    const { result } = renderHook(() => useExpandedState(index));
    const before = result.current.expanded;
    act(() => result.current.expand(['']));
    act(() => result.current.collapse('src'));
    expect(result.current.expanded).toBe(before);
  });

  it('expands and collapses all folders', () => {
    const { result } = renderHook(() => useExpandedState(index));
    act(() => result.current.expandAll());
    expect(sorted(result.current.expanded)).toEqual(['', 'src', 'src/components']);
    act(() => result.current.collapseAll());
    expect(sorted(result.current.expanded)).toEqual(['']);
  });

  it('saves the state and restores it after a refresh', () => {
    const first = renderHook(() => useExpandedState(index));
    act(() => first.result.current.expand(['src']));
    first.unmount();
    expect(JSON.parse(sessionStorage.getItem(EXPANDED_STORAGE_KEY)!)).toEqual(['', 'src']);

    const second = renderHook(() => useExpandedState(index));
    expect(sorted(second.result.current.expanded)).toEqual(['', 'src']);
  });

  it('ignores saved paths that are not folders in the tree', () => {
    sessionStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(['', 'package.json', 'gone']));
    const { result } = renderHook(() => useExpandedState(index));
    expect(sorted(result.current.expanded)).toEqual(['']);
  });

  it('ignores saved data that is not a list of paths', () => {
    sessionStorage.setItem(EXPANDED_STORAGE_KEY, '{"bad":true}');
    const { result } = renderHook(() => useExpandedState(index));
    expect(sorted(result.current.expanded)).toEqual(['']);
  });

  it('expands the ancestors of the node to reveal', () => {
    const { result } = renderHook(() => useExpandedState(index, 'src/components/Button.tsx'));
    expect(sorted(result.current.expanded)).toEqual(['', 'src', 'src/components']);
  });
});

import { describe, expect, it } from 'vitest';
import { buildIndex } from './buildIndex';
import { SAMPLE_TREE } from './sampleTree';
import { findMatchRange, searchByName } from './search';

const index = buildIndex(SAMPLE_TREE);

/**
 * Searches the sample tree and returns the paths of the results.
 * @param query - Search text.
 * @returns Result paths.
 */
function searchPaths(query: string): string[] {
  return searchByName(index, query).map((node) => node.path);
}

describe('searchByName', () => {
  it('finds a node at any depth and returns its full path', () => {
    expect(searchPaths('Button')).toEqual(['src/components/Button.tsx']);
  });

  it('ignores letter case', () => {
    expect(searchPaths('bUtToN')).toEqual(['src/components/Button.tsx']);
  });

  it('matches part of a name and returns results in tree order', () => {
    expect(searchPaths('.t')).toEqual(['src/index.ts', 'src/components/Button.tsx']);
  });

  it('finds folders too', () => {
    expect(searchPaths('comp')).toEqual(['src/components']);
  });

  it('skips the root', () => {
    expect(searchPaths('root')).toEqual([]);
  });

  it('trims the query', () => {
    expect(searchPaths('  package  ')).toEqual(['package.json']);
  });

  it.each(['', '   '])('returns nothing for empty query %j', (query) => {
    expect(searchPaths(query)).toEqual([]);
  });

  it('returns nothing when no name matches', () => {
    expect(searchPaths('xyz')).toEqual([]);
  });
});

describe('findMatchRange', () => {
  it('returns the range of the first match', () => {
    expect(findMatchRange('Button.tsx', 'tt')).toEqual([2, 4]);
  });

  it('ignores letter case and trims the query', () => {
    expect(findMatchRange('Button.tsx', ' BUT ')).toEqual([0, 3]);
  });

  it('returns null when there is no match', () => {
    expect(findMatchRange('Button.tsx', 'xyz')).toBeNull();
  });

  it('returns null when lower-casing changes the length of the name', () => {
    expect(findMatchRange('İstanbul.txt', 'stan')).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(findMatchRange('Button.tsx', ' ')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { buildIndex } from './buildIndex';
import { flattenVisible } from './flattenVisible';
import { SAMPLE_TREE } from './sampleTree';

const index = buildIndex(SAMPLE_TREE);

/**
 * Lists the paths of visible nodes.
 * @param expanded - Paths of expanded folders.
 * @returns Visible paths in display order.
 */
function visiblePaths(expanded: string[]): string[] {
  return flattenVisible(index, new Set(expanded)).map((node) => node.path);
}

describe('flattenVisible', () => {
  it('shows only the root when nothing is expanded', () => {
    expect(visiblePaths([])).toEqual(['']);
  });

  it('shows direct children of an expanded root', () => {
    expect(visiblePaths([''])).toEqual(['', 'src', 'package.json']);
  });

  it('shows nested children in pre-order', () => {
    expect(visiblePaths(['', 'src', 'src/components'])).toEqual([
      '',
      'src',
      'src/index.ts',
      'src/components',
      'src/components/Button.tsx',
      'package.json',
    ]);
  });

  it('hides children of an expanded folder inside a collapsed folder', () => {
    expect(visiblePaths(['', 'src/components'])).toEqual(['', 'src', 'package.json']);
  });

  it('ignores expanded paths of files and unknown paths', () => {
    expect(visiblePaths(['', 'package.json', 'missing'])).toEqual(['', 'src', 'package.json']);
  });
});

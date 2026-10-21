import { describe, expect, it } from 'vitest';
import { buildIndex } from './buildIndex';
import { countGeneratedNodes, generateTree } from './generateTree';
import { validateTree } from './parseTree';

describe('generateTree', () => {
  it('creates the expected number of nodes', () => {
    const options = { depth: 3, foldersPerFolder: 4, filesPerFolder: 2 };
    const index = buildIndex(generateTree(options));
    // Folders: 1 + 4 + 16 + 64 = 85, each with 2 files.
    expect(countGeneratedNodes(options)).toBe(85 * 3);
    expect(index.nodes.size).toBe(countGeneratedNodes(options));
  });

  it('creates a valid tree', () => {
    const tree = generateTree({ depth: 2, foldersPerFolder: 3, filesPerFolder: 3 });
    expect(validateTree(tree).ok).toBe(true);
  });

  it('is deterministic', () => {
    const options = { depth: 2, foldersPerFolder: 2, filesPerFolder: 2 };
    expect(generateTree(options)).toEqual(generateTree(options));
  });

  it('creates only files in the root when depth is 0', () => {
    const tree = generateTree({ depth: 0, foldersPerFolder: 5, filesPerFolder: 3 });
    expect(tree.children.map((c) => c.type)).toEqual(['file', 'file', 'file']);
  });

  it('handles a 50 000+ node tree quickly', () => {
    const options = { depth: 4, foldersPerFolder: 10, filesPerFolder: 4 };
    const start = performance.now();
    const index = buildIndex(generateTree(options));
    expect(index.nodes.size).toBe(countGeneratedNodes(options));
    expect(index.nodes.size).toBeGreaterThan(50_000);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

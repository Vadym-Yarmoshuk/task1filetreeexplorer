import { describe, expect, it } from 'vitest';
import { deepTreeJson } from '../test/fixtures';
import { buildIndex } from './buildIndex';
import { parseTreeJson } from './parseTree';
import { SAMPLE_TREE } from './sampleTree';

describe('buildIndex', () => {
  const index = buildIndex(SAMPLE_TREE);

  it('indexes every node by path, in pre-order', () => {
    expect([...index.nodes.keys()]).toEqual([
      '',
      'src',
      'src/index.ts',
      'src/components',
      'src/components/Button.tsx',
      'package.json',
    ]);
  });

  it('stores the root under the empty path', () => {
    expect(index.root).toBe(index.nodes.get(''));
    expect(index.root).toMatchObject({ name: 'root', parentPath: null, depth: 0 });
  });

  it('stores parent path, depth and child paths', () => {
    expect(index.nodes.get('src/components')).toMatchObject({
      name: 'components',
      type: 'folder',
      parentPath: 'src',
      depth: 2,
      position: 1,
      childPaths: ['src/components/Button.tsx'],
    });
    expect(index.nodes.get('package.json')).toMatchObject({
      type: 'file',
      parentPath: '',
      depth: 1,
      position: 1,
      childPaths: [],
      size: 300,
    });
  });

  it('computes the total size of each folder subtree', () => {
    expect(index.nodes.get('src/components')!.size).toBe(512);
    expect(index.nodes.get('src')!.size).toBe(1024 + 512);
    expect(index.root.size).toBe(1024 + 512 + 300);
  });

  it('gives an empty folder size 0', () => {
    const empty = buildIndex({
      name: 'root',
      type: 'folder',
      children: [{ name: 'empty', type: 'folder', children: [] }],
    });
    expect(empty.nodes.get('empty')!.size).toBe(0);
    expect(empty.root.size).toBe(0);
  });

  it('handles a tree nested 5 000 levels deep', () => {
    const parsed = parseTreeJson(deepTreeJson(5_000));
    if (!parsed.ok) throw new Error(parsed.error.message);
    const deep = buildIndex(parsed.tree);
    expect(deep.nodes.size).toBe(5_002);
    expect(deep.root.size).toBe(7);
    const leafPath = [...deep.nodes.keys()].at(-1)!;
    expect(deep.nodes.get(leafPath)).toMatchObject({ name: 'leaf.txt', depth: 5_001 });
  });
});

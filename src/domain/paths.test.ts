import { describe, expect, it } from 'vitest';
import {
  decodeNodePath,
  encodeNodePath,
  getAncestorPaths,
  joinPath,
  ROOT_PATH,
  toDisplayPath,
} from './paths';

describe('joinPath', () => {
  it('returns the name for a child of the root', () => {
    expect(joinPath(ROOT_PATH, 'src')).toBe('src');
  });

  it('joins parent path and name with a slash', () => {
    expect(joinPath('src/components', 'Button.tsx')).toBe('src/components/Button.tsx');
  });
});

describe('encodeNodePath / decodeNodePath', () => {
  it('encodes slashes so the path is one URL segment', () => {
    expect(encodeNodePath('src/components/Button.tsx')).toBe('src%2Fcomponents%2FButton.tsx');
  });

  it.each(['src/index.ts', 'my folder/file name.txt', 'a#b?c%d/ż.txt', 'back\\slash'])(
    'round-trips "%s"',
    (path) => {
      expect(decodeNodePath(encodeNodePath(path))).toBe(path);
    },
  );

  it('returns null for invalid encoding', () => {
    expect(decodeNodePath('%E0%A4%A')).toBeNull();
  });
});

describe('getAncestorPaths', () => {
  it('returns no ancestors for the root', () => {
    expect(getAncestorPaths(ROOT_PATH)).toEqual([]);
  });

  it('returns only the root for a top-level node', () => {
    expect(getAncestorPaths('src')).toEqual(['']);
  });

  it('returns all ancestors from the root down to the parent', () => {
    expect(getAncestorPaths('src/components/Button.tsx')).toEqual(['', 'src', 'src/components']);
  });
});

describe('toDisplayPath', () => {
  it('returns the root name for the root', () => {
    expect(toDisplayPath('root', ROOT_PATH)).toBe('root');
  });

  it('prefixes the path with the root name', () => {
    expect(toDisplayPath('root', 'src/index.ts')).toBe('root/src/index.ts');
  });
});

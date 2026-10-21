import { describe, expect, it } from 'vitest';
import { detailsUrl, NODE_PARAM, treeUrl } from './routes';

describe('detailsUrl', () => {
  it('encodes the path as one segment', () => {
    expect(detailsUrl('src/components/Button.tsx')).toBe('/tree/src%2Fcomponents%2FButton.tsx');
  });

  it('links the root to the tree view', () => {
    expect(detailsUrl('')).toBe('/tree');
  });
});

describe('treeUrl', () => {
  it('returns the plain tree URL without a node or for the root', () => {
    expect(treeUrl()).toBe('/tree');
    expect(treeUrl('')).toBe('/tree');
  });

  it('adds the node to reveal as a query parameter', () => {
    const url = new URL(treeUrl('my docs/a&b.txt'), 'http://localhost');
    expect(url.pathname).toBe('/tree');
    expect(url.searchParams.get(NODE_PARAM)).toBe('my docs/a&b.txt');
  });
});

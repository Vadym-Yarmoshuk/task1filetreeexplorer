import { ROOT_PATH } from './paths';
import type { IndexedNode, TreeIndex } from './types';

/**
 * Normalizes text for case-insensitive comparison.
 * @param text - Text to normalize.
 * @returns Lower-case text.
 */
function normalize(text: string): string {
  return text.toLocaleLowerCase();
}

/**
 * Finds all nodes whose name contains the query (case-insensitive). The root is skipped.
 * @param index - Tree index.
 * @param query - Search text. Leading and trailing spaces are ignored.
 * @returns Matching nodes in tree order. Empty if the query is empty.
 */
export function searchByName(index: TreeIndex, query: string): IndexedNode[] {
  const needle = normalize(query.trim());
  if (needle === '') {
    return [];
  }
  const results: IndexedNode[] = [];
  for (const node of index.nodes.values()) {
    if (node.path !== ROOT_PATH && normalize(node.name).includes(needle)) {
      results.push(node);
    }
  }
  return results;
}

/**
 * Finds the first match of the query in a name, for highlighting.
 * @param name - Node name.
 * @param query - Search text. Leading and trailing spaces are ignored.
 * @returns Start and end index of the match (end is exclusive), or null if there is no match.
 *   Also null if lower-casing changes the length of the name (for example "İ"), because
 *   the indexes would not match the original text.
 */
export function findMatchRange(name: string, query: string): [number, number] | null {
  const needle = normalize(query.trim());
  const haystack = normalize(name);
  if (needle === '' || haystack.length !== name.length) {
    return null;
  }
  const start = haystack.indexOf(needle);
  return start === -1 ? null : [start, start + needle.length];
}

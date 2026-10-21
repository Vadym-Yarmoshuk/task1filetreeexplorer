import { encodeNodePath, ROOT_PATH } from '../domain/paths';

/** Query parameter with the path of the node to reveal and focus in the tree view. */
export const NODE_PARAM = 'node';

/** Query parameter with the search text. */
export const SEARCH_PARAM = 'q';

/**
 * Builds the URL of the details view of a node.
 * @param path - Node path. The root has no details view, so it links to the tree.
 * @returns The URL, for example "/tree/src%2Findex.ts".
 */
export function detailsUrl(path: string): string {
  return path === ROOT_PATH ? '/tree' : `/tree/${encodeNodePath(path)}`;
}

/**
 * Builds the URL of the tree view.
 * @param revealPath - Path of a node to reveal and focus. Optional.
 * @returns The URL, for example "/tree?node=src%2Findex.ts".
 */
export function treeUrl(revealPath?: string): string {
  if (revealPath === undefined || revealPath === ROOT_PATH) {
    return '/tree';
  }
  return `/tree?${new URLSearchParams({ [NODE_PARAM]: revealPath }).toString()}`;
}

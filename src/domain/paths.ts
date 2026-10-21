/** Path of the root node. */
export const ROOT_PATH = '';

/** Separator between path segments. */
export const PATH_SEPARATOR = '/';

/**
 * Builds the path of a child node.
 * @param parentPath - Path of the parent folder.
 * @param name - Name of the child node.
 * @returns The child path, for example "src/index.ts".
 */
export function joinPath(parentPath: string, name: string): string {
  return parentPath === ROOT_PATH ? name : `${parentPath}${PATH_SEPARATOR}${name}`;
}

/**
 * Encodes a node path as one URL segment.
 * @param path - Node path, for example "src/components/Button.tsx".
 * @returns The encoded segment, for example "src%2Fcomponents%2FButton.tsx".
 */
export function encodeNodePath(path: string): string {
  return encodeURIComponent(path);
}

/**
 * Decodes a URL segment back to a node path.
 * @param segment - Encoded segment from the URL.
 * @returns The node path, or null if the segment is not valid URI encoding.
 */
export function decodeNodePath(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Lists the paths of all ancestors of a node, from the root down to the parent.
 * @param path - Node path.
 * @returns Ancestor paths. For "src/a/b.ts": ["", "src", "src/a"]. For the root: [].
 */
export function getAncestorPaths(path: string): string[] {
  if (path === ROOT_PATH) {
    return [];
  }
  const segments = path.split(PATH_SEPARATOR);
  const ancestors = [ROOT_PATH];
  for (let i = 1; i < segments.length; i++) {
    ancestors.push(segments.slice(0, i).join(PATH_SEPARATOR));
  }
  return ancestors;
}

/**
 * Builds the full path for display, including the root name.
 * @param rootName - Name of the root folder.
 * @param path - Node path without the root name.
 * @returns The display path, for example "root/src/index.ts".
 */
export function toDisplayPath(rootName: string, path: string): string {
  return path === ROOT_PATH ? rootName : `${rootName}${PATH_SEPARATOR}${path}`;
}

/** sessionStorage key for the paths of expanded folders. */
export const EXPANDED_STORAGE_KEY = 'filetree-explorer:expanded';

/** sessionStorage key for the path of the node with keyboard focus in the tree. */
export const FOCUSED_STORAGE_KEY = 'filetree-explorer:focused';

/**
 * Reads the saved paths of expanded folders.
 * @returns The saved paths, or null if nothing valid is saved.
 */
export function loadExpandedPaths(): string[] | null {
  try {
    const text = sessionStorage.getItem(EXPANDED_STORAGE_KEY);
    if (text === null) {
      return null;
    }
    const value: unknown = JSON.parse(text);
    return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null;
  } catch {
    return null;
  }
}

/**
 * Saves the paths of expanded folders for this browser tab.
 * @param paths - Paths of expanded folders.
 */
export function saveExpandedPaths(paths: Iterable<string>): void {
  try {
    sessionStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...paths]));
  } catch {
    // Storage is full or not available. The tree still works, but the state is lost on refresh.
  }
}

/**
 * Reads the saved path of the focused tree node.
 * @returns The saved path, or null if nothing is saved.
 */
export function loadFocusedPath(): string | null {
  try {
    return sessionStorage.getItem(FOCUSED_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves the path of the focused tree node, so the tree opens at the same place after "back".
 * @param path - Path of the focused node.
 */
export function saveFocusedPath(path: string): void {
  try {
    sessionStorage.setItem(FOCUSED_STORAGE_KEY, path);
  } catch {
    // Storage is full or not available. The tree opens at the root next time.
  }
}

/** Removes the saved tree view state (expanded folders and focus), for example after a new tree is loaded. */
export function clearExpandedPaths(): void {
  try {
    sessionStorage.removeItem(EXPANDED_STORAGE_KEY);
    sessionStorage.removeItem(FOCUSED_STORAGE_KEY);
  } catch {
    // Storage is not available. There is nothing to remove.
  }
}

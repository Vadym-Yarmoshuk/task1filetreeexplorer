/** sessionStorage key for the paths of expanded folders. */
export const EXPANDED_STORAGE_KEY = 'filetree-explorer:expanded';

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

/** Removes the saved paths, for example after a new tree is loaded. */
export function clearExpandedPaths(): void {
  try {
    sessionStorage.removeItem(EXPANDED_STORAGE_KEY);
  } catch {
    // Storage is not available. There is nothing to remove.
  }
}

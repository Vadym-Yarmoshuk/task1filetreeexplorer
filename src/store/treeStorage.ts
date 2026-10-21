/** localStorage key for the raw JSON text of the loaded tree. */
export const TREE_STORAGE_KEY = 'filetree-explorer:tree';

/**
 * Reads the saved JSON text of the tree.
 * @returns The saved text, or null if nothing is saved or storage is not available.
 */
export function loadTreeText(): string | null {
  try {
    return localStorage.getItem(TREE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves the JSON text of the tree. The raw text is saved, not JSON.stringify of the tree,
 * because JSON.stringify overflows the stack on very deep trees.
 * @param text - JSON text to save.
 * @returns True if the text was saved. False if storage is full or not available.
 */
export function saveTreeText(text: string): boolean {
  try {
    localStorage.setItem(TREE_STORAGE_KEY, text);
    return true;
  } catch {
    // Remove an older tree, so a refresh does not show a different tree than the one in memory.
    clearTreeText();
    return false;
  }
}

/** Removes the saved tree. */
export function clearTreeText(): void {
  try {
    localStorage.removeItem(TREE_STORAGE_KEY);
  } catch {
    // Storage is not available. There is nothing to remove.
  }
}

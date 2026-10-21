import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearTreeText, loadTreeText, saveTreeText, TREE_STORAGE_KEY } from './treeStorage';

describe('treeStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves, loads and clears the tree text', () => {
    expect(loadTreeText()).toBeNull();
    expect(saveTreeText('{"a":1}')).toBe(true);
    expect(localStorage.getItem(TREE_STORAGE_KEY)).toBe('{"a":1}');
    expect(loadTreeText()).toBe('{"a":1}');
    clearTreeText();
    expect(loadTreeText()).toBeNull();
  });

  it('returns false and removes the old tree when storage is full', () => {
    saveTreeText('old');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(saveTreeText('new')).toBe(false);
    expect(loadTreeText()).toBeNull();
  });

  it('returns null when storage is not available', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    expect(loadTreeText()).toBeNull();
  });

  it('does not throw when clearing unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    expect(() => clearTreeText()).not.toThrow();
  });
});

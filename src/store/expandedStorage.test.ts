import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearExpandedPaths,
  EXPANDED_STORAGE_KEY,
  loadExpandedPaths,
  saveExpandedPaths,
} from './expandedStorage';

describe('expandedStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves, loads and clears paths', () => {
    expect(loadExpandedPaths()).toBeNull();
    saveExpandedPaths(new Set(['', 'src']));
    expect(loadExpandedPaths()).toEqual(['', 'src']);
    clearExpandedPaths();
    expect(loadExpandedPaths()).toBeNull();
  });

  it.each(['not json', '{"a":1}', '[1,2]'])('returns null for invalid data %j', (text) => {
    sessionStorage.setItem(EXPANDED_STORAGE_KEY, text);
    expect(loadExpandedPaths()).toBeNull();
  });

  it('does not throw when storage is not available', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    expect(() => saveExpandedPaths([''])).not.toThrow();
    expect(() => clearExpandedPaths()).not.toThrow();
  });
});

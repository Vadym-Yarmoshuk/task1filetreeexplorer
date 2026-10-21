import { describe, expect, it } from 'vitest';
import { formatSize } from './formatSize';

describe('formatSize', () => {
  it.each([
    [0, '0 B'],
    [300, '300 B'],
    [1023, '1023 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [10_240, '10 KB'],
    [1024 * 1024 - 1, '1 MB'],
    [1024 * 1024, '1 MB'],
    [5.25 * 1024 * 1024, '5.3 MB'],
    [3 * 1024 ** 3, '3072 MB'],
  ])('formats %d bytes as "%s"', (bytes, expected) => {
    expect(formatSize(bytes)).toBe(expected);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('throws RangeError for %d', (bytes) => {
    expect(() => formatSize(bytes)).toThrow(RangeError);
  });
});

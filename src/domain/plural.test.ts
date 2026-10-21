import { describe, expect, it } from 'vitest';
import { FILE_FORMS, pluralize } from './plural';

describe('pluralize', () => {
  it.each([
    [0, 'plików'],
    [1, 'plik'],
    [2, 'pliki'],
    [4, 'pliki'],
    [5, 'plików'],
    [11, 'plików'],
    [12, 'plików'],
    [14, 'plików'],
    [21, 'plików'],
    [22, 'pliki'],
    [104, 'pliki'],
    [112, 'plików'],
  ])('uses the right form for %d', (count, form) => {
    expect(pluralize(count, FILE_FORMS)).toBe(`${count} ${form}`);
  });

  it('adds a thousands separator', () => {
    expect(pluralize(55_555, FILE_FORMS).replace(/\s/g, ' ')).toBe('55 555 plików');
  });
});

/** Polish noun forms: [one, few, many], for example ["plik", "pliki", "plików"]. */
export type PluralForms = readonly [one: string, few: string, many: string];

/** Forms of "węzeł" (node). */
export const NODE_FORMS: PluralForms = ['węzeł', 'węzły', 'węzłów'];
/** Forms of "plik" (file). */
export const FILE_FORMS: PluralForms = ['plik', 'pliki', 'plików'];
/** Forms of "folder". */
export const FOLDER_FORMS: PluralForms = ['folder', 'foldery', 'folderów'];
/** Forms of "element" (item). */
export const ITEM_FORMS: PluralForms = ['element', 'elementy', 'elementów'];
/** Forms of "wynik" (result). */
export const RESULT_FORMS: PluralForms = ['wynik', 'wyniki', 'wyników'];

/**
 * Formats a count with the correct Polish noun form, for example "1 plik", "3 pliki", "5 plików".
 * @param count - Non-negative integer.
 * @param forms - Noun forms for one, few and many.
 * @returns The count with a thousands separator and the noun.
 */
export function pluralize(count: number, forms: PluralForms): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  let form: string;
  if (count === 1) {
    form = forms[0];
  } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    form = forms[1];
  } else {
    form = forms[2];
  }
  return `${count.toLocaleString('pl-PL')} ${form}`;
}

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEARCH_PARAM } from '../../app/routes';

/**
 * Keeps the search query in the URL (?q=...), so the results survive a page refresh
 * and the browser "back" button returns to them.
 * @returns The current query and a function that updates it. Other query parameters are kept.
 */
export function useSearchQuery(): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(SEARCH_PARAM) ?? '';

  const setQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value.trim() === '') {
            next.delete(SEARCH_PARAM);
          } else {
            next.set(SEARCH_PARAM, value);
          }
          return next;
        },
        // Typing must not add a history entry for every character.
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [query, setQuery];
}

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

/** Delay between the last key press and the URL update, in milliseconds. */
export const SEARCH_DEBOUNCE_MS = 250;

/** Props for {@link SearchBar}. */
interface SearchBarProps {
  /** Query from the URL. */
  query: string;
  /** Saves the query in the URL. */
  onQueryChange: (value: string) => void;
}

/**
 * Search field. Shows typed text at once and saves it in the URL after a short pause.
 * Enter saves at once, Escape clears the field.
 * @param props - Component props.
 * @returns The search field.
 */
export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);

  // The URL can change from outside (browser "back" button). Show the new value in the field.
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setDraft(query);
  }

  useEffect(() => {
    if (draft === query) {
      return;
    }
    const timer = setTimeout(() => onQueryChange(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, query, onQueryChange]);

  const clear = () => {
    setDraft('');
    onQueryChange('');
  };

  return (
    <TextField
      type="search"
      label="Szukaj po nazwie"
      placeholder="np. Button albo .tsx"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onQueryChange(draft);
        } else if (event.key === 'Escape') {
          clear();
        }
      }}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon aria-hidden />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position="end">
              <IconButton aria-label="Wyczyść wyszukiwanie" edge="end" onClick={clear}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
        // Hide the browser's own clear button; the MUI button above does the same job.
        htmlInput: { sx: { '&::-webkit-search-cancel-button': { display: 'none' } } },
      }}
    />
  );
}

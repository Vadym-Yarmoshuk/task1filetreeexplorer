import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('saves the query once, after the user stops typing', async () => {
    const onQueryChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar query="" onQueryChange={onQueryChange} />);

    await user.type(screen.getByRole('searchbox'), 'abc');
    expect(onQueryChange).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onQueryChange).toHaveBeenCalledWith('abc'));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('shows a new query that comes from outside (browser back button)', () => {
    const { rerender } = render(<SearchBar query="first" onQueryChange={() => {}} />);
    expect(screen.getByRole('searchbox')).toHaveValue('first');
    rerender(<SearchBar query="second" onQueryChange={() => {}} />);
    expect(screen.getByRole('searchbox')).toHaveValue('second');
  });
});

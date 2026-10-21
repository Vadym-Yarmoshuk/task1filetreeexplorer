import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { generateTree } from '../../domain/generateTree';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import { renderApp } from '../../test/renderApp';

/**
 * Returns the search input.
 * @returns The input element.
 */
function searchInput(): HTMLElement {
  return screen.getByRole('searchbox', { name: 'Szukaj po nazwie' });
}

describe('search', () => {
  it('searches the whole tree and saves the query in the URL', async () => {
    const { user, location } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.type(searchInput(), 'button');

    await waitFor(() => expect(location().search).toBe('?q=button'));
    expect(screen.getByRole('status')).toHaveTextContent('Znaleziono 1 wynik dla „button”.');
    const results = screen.getByRole('list', { name: 'Wyniki wyszukiwania' });
    expect(within(results).getByText('root/src/components/Button.tsx · 512 B')).toBeInTheDocument();
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(document.title).toBe('Szukaj: button · FileTree Explorer');
  });

  it('shows results from the URL after a refresh', () => {
    renderApp({ route: '/tree?q=.ts', storedTree: SAMPLE_TREE });
    expect(searchInput()).toHaveValue('.ts');
    expect(screen.getByRole('status')).toHaveTextContent('Znaleziono 2 wyniki');
    const items = within(screen.getByRole('list', { name: 'Wyniki wyszukiwania' })).getAllByRole(
      'listitem',
    );
    expect(items).toHaveLength(2);
  });

  it('highlights the matching part of the name', () => {
    renderApp({ route: '/tree?q=TT', storedTree: SAMPLE_TREE });
    const mark = screen.getByText('tt', { selector: 'mark' });
    expect(mark.parentElement).toHaveTextContent('Button.tsx');
  });

  it('shows a message when nothing matches', () => {
    renderApp({ route: '/tree?q=xyz', storedTree: SAMPLE_TREE });
    expect(screen.getByRole('status')).toHaveTextContent('Brak wyników dla „xyz”.');
    expect(screen.queryByRole('list', { name: 'Wyniki wyszukiwania' })).not.toBeInTheDocument();
  });

  it('opens the details of a result', async () => {
    const { user, location } = renderApp({ route: '/tree?q=comp', storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('link', { name: /^components/ }));
    expect(location().pathname).toBe('/tree/src%2Fcomponents');
  });

  it('shows a result in the tree', async () => {
    const { user, location } = renderApp({ route: '/tree?q=button', storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('link', { name: 'Pokaż w drzewie: Button.tsx' }));
    // The ?node= parameter is used once and removed.
    expect(location().search).toBe('');
    const tree = screen.getByRole('tree');
    const active = document.getElementById(tree.getAttribute('aria-activedescendant')!)!;
    expect(active).toHaveAttribute('aria-label', 'Button.tsx, 512 B');
    // Keyboard focus moves to the tree, so the arrow keys work at once.
    expect(tree).toHaveFocus();
  });

  it('clears the search with the clear button and shows the tree again', async () => {
    const { user, location } = renderApp({ route: '/tree?q=button', storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    expect(location().search).toBe('');
    expect(searchInput()).toHaveValue('');
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('clears the search with Escape', async () => {
    const { user, location } = renderApp({ route: '/tree?q=button', storedTree: SAMPLE_TREE });
    await user.click(searchInput());
    await user.keyboard('{Escape}');
    expect(location().search).toBe('');
  });

  it('saves the query at once on Enter and keeps other parameters', async () => {
    const { user, location } = renderApp({ route: '/tree?other=1', storedTree: SAMPLE_TREE });
    await user.type(searchInput(), 'index{Enter}');
    expect(new URLSearchParams(location().search).get('q')).toBe('index');
    expect(new URLSearchParams(location().search).get('other')).toBe('1');
  });

  it('keeps the tree state while searching', async () => {
    const { user } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('treeitem', { name: 'src, 1.5 KB' }));
    await user.type(searchInput(), 'x{Enter}');
    await user.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    expect(screen.getByRole('treeitem', { name: 'components, 512 B' })).toBeInTheDocument();
  });

  it('renders only the visible results of a large search', () => {
    const tree = generateTree({ depth: 3, foldersPerFolder: 10, filesPerFolder: 10 });
    renderApp({ route: '/tree?q=file-', storedTree: tree });
    expect(screen.getByRole('status')).toHaveTextContent('Znaleziono 11 110 wyników');
    const items = within(screen.getByRole('list', { name: 'Wyniki wyszukiwania' })).getAllByRole(
      'listitem',
    );
    expect(items.length).toBeLessThan(50);
  });
});

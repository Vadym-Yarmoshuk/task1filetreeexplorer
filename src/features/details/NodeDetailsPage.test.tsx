import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { detailsUrl } from '../../app/routes';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import type { FolderNode } from '../../domain/types';
import { renderApp } from '../../test/renderApp';

/**
 * Reads the value next to a label in the details list.
 * @param label - Label text (dt).
 * @returns The value element (dd).
 */
function detail(label: string): HTMLElement {
  const term = screen.getByText(label, { selector: 'dt' });
  return term.nextElementSibling as HTMLElement;
}

describe('NodeDetailsPage', () => {
  it('shows file details: name, formatted size and full path', () => {
    renderApp({ route: detailsUrl('src/index.ts'), storedTree: SAMPLE_TREE });
    expect(screen.getByRole('heading', { level: 1, name: 'index.ts' })).toBeInTheDocument();
    expect(screen.getByText('Plik')).toBeInTheDocument();
    expect(detail('Nazwa')).toHaveTextContent('index.ts');
    expect(detail('Rozmiar')).toHaveTextContent(/^1 KB \(1024 B\)/);
    expect(detail('Pełna ścieżka')).toHaveTextContent('root/src/index.ts');
    expect(document.title).toBe('index.ts · FileTree Explorer');
  });

  it('shows the size without bytes in brackets when it is below 1 KB', () => {
    renderApp({ route: detailsUrl('package.json'), storedTree: SAMPLE_TREE });
    expect(detail('Rozmiar')).toHaveTextContent(/^300 B$/);
  });

  it('shows folder details: child count, total size and children with links', async () => {
    const { user, location } = renderApp({ route: detailsUrl('src'), storedTree: SAMPLE_TREE });
    expect(screen.getByText('Folder')).toBeInTheDocument();
    expect(detail('Liczba bezpośrednich dzieci')).toHaveTextContent('2 elementy');
    expect(detail('Całkowity rozmiar')).toHaveTextContent(/^1\.5 KB \(1536 B\)/);

    const list = screen.getByRole('list', { name: 'Zawartość folderu src' });
    const links = within(list).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'index.ts1 KB',
      'components1 element · 512 B',
    ]);

    await user.click(within(list).getByRole('link', { name: /components/ }));
    expect(location().pathname).toBe('/tree/src%2Fcomponents');
    expect(screen.getByRole('heading', { level: 1, name: 'components' })).toBeInTheDocument();
  });

  it('shows a message for an empty folder', () => {
    const tree: FolderNode = {
      name: 'root',
      type: 'folder',
      children: [{ name: 'empty', type: 'folder', children: [] }],
    };
    renderApp({ route: detailsUrl('empty'), storedTree: tree });
    expect(screen.getByText('Folder jest pusty.')).toBeInTheDocument();
    expect(detail('Liczba bezpośrednich dzieci')).toHaveTextContent('0 elementów');
  });

  it('shows breadcrumbs with links to ancestors', async () => {
    const { user, location } = renderApp({
      route: detailsUrl('src/components/Button.tsx'),
      storedTree: SAMPLE_TREE,
    });
    const breadcrumbs = screen.getByRole('navigation', { name: 'Ścieżka' });
    expect(within(breadcrumbs).getByRole('link', { name: 'root' })).toHaveAttribute(
      'href',
      '/tree',
    );
    expect(within(breadcrumbs).getByText('Button.tsx')).toHaveAttribute('aria-current', 'page');

    await user.click(within(breadcrumbs).getByRole('link', { name: 'src' }));
    expect(location().pathname).toBe('/tree/src');
  });

  it('links to the parent folder and to the node in the tree', async () => {
    const { user, location } = renderApp({
      route: detailsUrl('src/components/Button.tsx'),
      storedTree: SAMPLE_TREE,
    });
    expect(screen.getByRole('link', { name: 'Folder nadrzędny' })).toHaveAttribute(
      'href',
      '/tree/src%2Fcomponents',
    );

    await user.click(screen.getByRole('link', { name: 'Pokaż w drzewie' }));
    expect(location().pathname).toBe('/tree');
    const tree = screen.getByRole('tree');
    const activeRow = document.getElementById(tree.getAttribute('aria-activedescendant')!)!;
    expect(activeRow).toHaveAttribute('aria-label', 'Button.tsx, 512 B');
  });

  it('moves keyboard focus to the heading when another node opens', async () => {
    const { user } = renderApp({ route: detailsUrl('src'), storedTree: SAMPLE_TREE });
    expect(screen.getByRole('heading', { level: 1, name: 'src' })).toHaveFocus();

    const list = screen.getByRole('list', { name: 'Zawartość folderu src' });
    await user.click(within(list).getByRole('link', { name: /^components/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'components' })).toHaveFocus();
  });

  it('links a top-level node to the tree as its parent', () => {
    renderApp({ route: detailsUrl('package.json'), storedTree: SAMPLE_TREE });
    expect(screen.getByRole('link', { name: 'Folder nadrzędny' })).toHaveAttribute('href', '/tree');
  });

  it('handles names with special characters, including a literal "%2F"', () => {
    const tree: FolderNode = {
      name: 'root',
      type: 'folder',
      children: [
        {
          name: 'my docs #1',
          type: 'folder',
          children: [{ name: 'zażółć 100%2F?.txt', type: 'file', size: 5 }],
        },
      ],
    };
    renderApp({ route: detailsUrl('my docs #1/zażółć 100%2F?.txt'), storedTree: tree });
    expect(
      screen.getByRole('heading', { level: 1, name: 'zażółć 100%2F?.txt' }),
    ).toBeInTheDocument();
    expect(detail('Pełna ścieżka')).toHaveTextContent('root/my docs #1/zażółć 100%2F?.txt');
  });

  it('copies the full path to the clipboard', async () => {
    const { user } = renderApp({ route: detailsUrl('src/index.ts'), storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('button', { name: 'Kopiuj ścieżkę' }));
    expect(await navigator.clipboard.readText()).toBe('root/src/index.ts');
    expect(await screen.findByText('Skopiowano ścieżkę')).toBeInTheDocument();
  });

  it('shows "not found" for a path that does not exist', () => {
    renderApp({ route: detailsUrl('src/missing.ts'), storedTree: SAMPLE_TREE });
    expect(screen.getByRole('heading', { name: 'Nie znaleziono węzła' })).toBeInTheDocument();
    expect(screen.getByText('src/missing.ts')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Przejdź do drzewa' })).toHaveAttribute(
      'href',
      '/tree',
    );
  });

  it('shows "not found" for a path with invalid encoding', () => {
    renderApp({ route: '/tree/%E0%A4%A', storedTree: SAMPLE_TREE });
    expect(screen.getByText(/niepoprawnie zakodowaną/)).toBeInTheDocument();
  });

  it('virtualizes a folder with many children', async () => {
    const tree: FolderNode = {
      name: 'root',
      type: 'folder',
      children: [
        {
          name: 'big',
          type: 'folder',
          children: Array.from({ length: 5000 }, (_, i) => ({
            name: `file-${i}.txt`,
            type: 'file' as const,
            size: i,
          })),
        },
      ],
    };
    renderApp({ route: detailsUrl('big'), storedTree: tree });
    const list = screen.getByRole('list', { name: 'Zawartość folderu big' });
    await waitFor(() => expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(5));
    expect(within(list).getAllByRole('listitem').length).toBeLessThan(50);
    expect(within(list).getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '5000');
  });
});

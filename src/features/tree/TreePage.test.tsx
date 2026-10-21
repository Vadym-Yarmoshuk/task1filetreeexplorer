import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { generateTree } from '../../domain/generateTree';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import { renderApp } from '../../test/renderApp';

/**
 * Finds a visible tree row by node name.
 * @param name - Node name.
 * @returns The row element.
 */
function row(name: string): HTMLElement {
  const found = screen
    .getAllByRole('treeitem')
    .find((item) => item.getAttribute('aria-label')?.startsWith(`${name}, `));
  if (!found) {
    throw new Error(`Row "${name}" not found`);
  }
  return found;
}

/**
 * Lists the names of all rendered rows.
 * @returns Row names in display order.
 */
function rowNames(): string[] {
  return screen
    .queryAllByRole('treeitem')
    .map((item) => item.getAttribute('aria-label')!.split(', ')[0]!);
}

/**
 * Finds the row that aria-activedescendant points to.
 * @returns The active row.
 */
function activeRow(): HTMLElement {
  const id = screen.getByRole('tree').getAttribute('aria-activedescendant')!;
  return document.getElementById(id)!;
}

describe('TreePage', () => {
  it('shows the root expanded with its direct children', () => {
    renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    expect(rowNames()).toEqual(['root', 'src', 'package.json']);
    expect(screen.getByText('3 pliki', { exact: false })).toBeInTheDocument();
  });

  it('sets ARIA attributes for levels, positions and expansion', () => {
    renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    expect(row('root')).toHaveAttribute('aria-level', '1');
    expect(row('root')).toHaveAttribute('aria-expanded', 'true');
    expect(row('src')).toHaveAttribute('aria-level', '2');
    expect(row('src')).toHaveAttribute('aria-expanded', 'false');
    expect(row('package.json')).toHaveAttribute('aria-posinset', '2');
    expect(row('package.json')).toHaveAttribute('aria-setsize', '2');
    expect(row('package.json')).not.toHaveAttribute('aria-expanded');
  });

  it('expands and collapses a folder on click', async () => {
    const { user } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(row('src'));
    expect(rowNames()).toEqual(['root', 'src', 'index.ts', 'components', 'package.json']);
    expect(row('src')).toHaveAttribute('aria-selected', 'true');
    await user.click(row('src'));
    expect(rowNames()).toEqual(['root', 'src', 'package.json']);
  });

  it('opens file details on click', async () => {
    const { user, location } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(row('package.json'));
    expect(location().pathname).toBe('/tree/package.json');
  });

  it('opens folder details with the info button', async () => {
    const { user, location } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(within(row('src')).getByRole('link', { name: 'Szczegóły: src' }));
    expect(location().pathname).toBe('/tree/src');
  });

  it('supports keyboard navigation', async () => {
    const { user, location } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    screen.getByRole('tree').focus();
    expect(activeRow()).toBe(row('root'));

    await user.keyboard('{ArrowDown}');
    expect(activeRow()).toBe(row('src'));

    await user.keyboard('{ArrowRight}');
    expect(row('src')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowRight}{ArrowDown}{ArrowRight}{ArrowRight}');
    expect(activeRow()).toBe(row('Button.tsx'));

    await user.keyboard('{Enter}');
    expect(location().pathname).toBe('/tree/src%2Fcomponents%2FButton.tsx');
  });

  it('moves focus to the folder when its focused child is hidden', async () => {
    const { user } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(row('src'));
    screen.getByRole('tree').focus();
    await user.keyboard('{ArrowDown}');
    expect(activeRow()).toBe(row('index.ts'));
    // Collapse "src" with the mouse: the focused row disappears.
    await user.click(row('src').querySelector('[aria-hidden="true"]')!);
    expect(activeRow()).toBe(row('src'));
  });

  it('reveals and focuses the node from the ?node= parameter', () => {
    renderApp({ route: '/tree?node=src%2Fcomponents%2FButton.tsx', storedTree: SAMPLE_TREE });
    expect(rowNames()).toContain('Button.tsx');
    expect(activeRow()).toBe(row('Button.tsx'));
  });

  it('restores the focused node when the user comes back from details', async () => {
    const first = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await first.user.click(row('src'));
    await first.user.click(row('index.ts'));
    expect(first.location().pathname).toBe('/tree/src%2Findex.ts');
    first.unmount();

    // "Back" mounts the tree page again.
    renderApp({ route: '/tree' });
    expect(activeRow()).toBe(row('index.ts'));
  });

  it('keeps focus on a folder that the user expands again', async () => {
    const { user } = renderApp({ route: '/tree?node=src%2Findex.ts', storedTree: SAMPLE_TREE });
    expect(activeRow()).toBe(row('index.ts'));

    await user.click(screen.getByRole('button', { name: 'Zwiń wszystko' }));
    expect(activeRow()).toBe(row('src'));

    screen.getByRole('tree').focus();
    await user.keyboard('{ArrowRight}');
    expect(row('src')).toHaveAttribute('aria-expanded', 'true');
    expect(activeRow()).toBe(row('src'));
  });

  it('moves focus to the folder when the user clicks its arrow', async () => {
    const { user } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    expect(activeRow()).toBe(row('root'));
    await user.click(row('src').querySelector('[aria-hidden="true"]')!);
    expect(row('src')).toHaveAttribute('aria-expanded', 'true');
    expect(activeRow()).toBe(row('src'));
    expect(screen.getByRole('tree')).toHaveFocus();
  });

  it('expands and collapses all folders', async () => {
    const { user } = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('button', { name: 'Rozwiń wszystko' }));
    expect(rowNames()).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Zwiń wszystko' }));
    expect(rowNames()).toEqual(['root', 'src', 'package.json']);
  });

  it('keeps expanded folders after a refresh', async () => {
    const first = renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    await first.user.click(row('src'));
    first.unmount();

    renderApp({ route: '/tree' });
    expect(rowNames()).toContain('components');
  });

  it('renders only the visible rows of a large tree', async () => {
    const largeTree = generateTree({ depth: 3, foldersPerFolder: 10, filesPerFolder: 10 });
    const { user } = renderApp({ route: '/tree', storedTree: largeTree });
    await user.click(screen.getByRole('button', { name: 'Rozwiń wszystko' }));

    // 12 221 nodes are visible after "expand all", but only a window of rows is in the DOM.
    const rendered = screen.getAllByRole('treeitem').length;
    expect(rendered).toBeGreaterThan(10);
    expect(rendered).toBeLessThan(100);
    expect(row('root')).toHaveAttribute('aria-setsize', '1');
  });
});

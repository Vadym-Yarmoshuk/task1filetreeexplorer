import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SAMPLE_TREE } from '../domain/sampleTree';
import { renderApp } from '../test/renderApp';
import { isRedirectState } from './redirectState';

describe('App routing', () => {
  it('shows the home page at "/"', () => {
    renderApp();
    expect(
      screen.getByRole('heading', { name: 'Wczytaj strukturę katalogów' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('FileTree Explorer');
  });

  it('disables the tree link when no tree is loaded', () => {
    renderApp();
    expect(screen.getByRole('link', { name: 'Drzewo' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('redirects /tree to the home page when no tree is loaded', () => {
    const { location } = renderApp({ route: '/tree?q=button' });
    expect(location().pathname).toBe('/');
    expect(screen.getByText(/najpierw wczytaj drzewo/)).toHaveTextContent('/tree?q=button');
  });

  it('returns to the requested view after loading a tree', async () => {
    const route = '/tree/src%2Fcomponents%2FButton.tsx';
    const { user, location } = renderApp({ route });
    fireEvent.change(screen.getByRole('textbox', { name: 'JSON' }), {
      target: { value: JSON.stringify(SAMPLE_TREE) },
    });
    await user.click(screen.getByRole('button', { name: 'Wczytaj' }));
    expect(location().pathname).toBe('/tree/src%2Fcomponents%2FButton.tsx');
  });

  it('opens the tree view directly when a tree is saved', () => {
    renderApp({ route: '/tree', storedTree: SAMPLE_TREE });
    expect(screen.getByRole('heading', { name: 'Drzewo: root' })).toBeInTheDocument();
    expect(document.title).toBe('Drzewo · FileTree Explorer');
  });

  it('decodes an encoded node path from the URL', () => {
    renderApp({ route: '/tree/src%2Fcomponents%2FButton.tsx', storedTree: SAMPLE_TREE });
    expect(screen.getByRole('heading', { name: 'Button.tsx' })).toBeInTheDocument();
  });

  it('shows the not found page for an unknown URL', () => {
    renderApp({ route: '/unknown' });
    expect(screen.getByRole('heading', { name: 'Nie znaleziono strony' })).toBeInTheDocument();
  });
});

describe('isRedirectState', () => {
  it.each([
    [{ from: '/tree' }, true],
    [null, false],
    ['text', false],
    [{ from: 1 }, false],
  ])('returns %s for %j', (state, expected) => {
    expect(isRedirectState(state)).toBe(expected);
  });
});

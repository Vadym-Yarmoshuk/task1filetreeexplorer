import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, parsePath, useLocation, type Location } from 'react-router-dom';
import { App } from '../app/App';
import { AppProviders } from '../app/AppProviders';
import { TREE_STORAGE_KEY } from '../store/treeStorage';
import type { FolderNode } from '../domain/types';

/** Options for {@link renderApp}. */
interface RenderAppOptions {
  /** Start URL. Default: "/". */
  route?: string;
  /** Tree saved in localStorage before the first render. */
  storedTree?: FolderNode;
  /** Router state of the start URL (location.state). */
  routerState?: unknown;
}

/**
 * Renders the whole application in a memory router.
 * @param options - Start URL, its router state and saved tree.
 * @returns Testing Library result, a user-event instance and a getter for the current location.
 */
export function renderApp({ route = '/', storedTree, routerState }: RenderAppOptions = {}) {
  if (storedTree) {
    localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(storedTree));
  }
  const current: { location: Location | null } = { location: null };

  /**
   * Stores the current location so tests can read it.
   * @returns Nothing visible.
   */
  function LocationSpy() {
    current.location = useLocation();
    return null;
  }

  const user = userEvent.setup();
  const result = render(
    <MemoryRouter
      initialEntries={[{ ...parsePath(route), state: routerState }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppProviders>
        <App />
        <LocationSpy />
      </AppProviders>
    </MemoryRouter>,
  );

  return {
    ...result,
    user,
    /**
     * Gives the current router location.
     * @returns The location.
     */
    location: () => current.location!,
  };
}

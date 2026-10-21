/** Router state passed to the home page when a view needs a tree. */
export interface RedirectState {
  /** Path and query of the view the user wanted to open. */
  from: string;
}

/**
 * Checks if router state is a redirect from RequireTree.
 * @param state - Value of location.state.
 * @returns True if the state contains the original path.
 */
export function isRedirectState(state: unknown): state is RedirectState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as Record<string, unknown>).from === 'string'
  );
}

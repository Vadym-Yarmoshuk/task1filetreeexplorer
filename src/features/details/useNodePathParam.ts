import { useLocation } from 'react-router-dom';
import { decodeNodePath } from '../../domain/paths';

/** URL prefix of the node details view. */
export const DETAILS_PREFIX = '/tree/';

/**
 * Reads the node path from the URL of the details view.
 * Decodes the raw pathname once, because useParams in React Router v6 decodes twice:
 * a name that contains "%2F" would become "/".
 * @returns The node path, or null if the URL is not valid.
 */
export function useNodePathParam(): string | null {
  const { pathname } = useLocation();
  if (!pathname.startsWith(DETAILS_PREFIX)) {
    return null;
  }
  return decodeNodePath(pathname.slice(DETAILS_PREFIX.length));
}

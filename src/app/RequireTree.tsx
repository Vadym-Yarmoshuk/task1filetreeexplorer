import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTreeData } from '../store/useTreeData';
import type { RedirectState } from './redirectState';

/** Props for {@link RequireTree}. */
interface RequireTreeProps {
  children: ReactNode;
}

/**
 * Shows its children only when a tree is loaded. Otherwise redirects to the home page
 * and keeps the original path, so the user returns to it after loading a tree.
 * @param props - Component props.
 * @returns The children, or a redirect.
 */
export function RequireTree({ children }: RequireTreeProps) {
  const { index } = useTreeData();
  const location = useLocation();

  if (!index) {
    const state: RedirectState = { from: location.pathname + location.search };
    return <Navigate to="/" replace state={state} />;
  }
  return children;
}

import { useEffect } from 'react';

/** Application name shown after the page title. */
export const APP_NAME = 'FileTree Explorer';

/**
 * Sets the browser tab title for the current view.
 * @param title - Title of the view. Null shows only the application name.
 */
export function useDocumentTitle(title: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}

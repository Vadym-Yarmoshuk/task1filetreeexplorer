import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { TreeDataProvider } from '../store/TreeDataProvider';
import { theme } from './theme';

/** Props for {@link AppProviders}. */
interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application in the theme and data providers. Used by main.tsx and by tests.
 * @param props - Component props.
 * @returns The children inside all providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TreeDataProvider>{children}</TreeDataProvider>
    </ThemeProvider>
  );
}

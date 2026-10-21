import { createTheme } from '@mui/material/styles';

/** Application-wide MUI theme. Follows the system light or dark mode. */
export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Roboto', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
  },
});

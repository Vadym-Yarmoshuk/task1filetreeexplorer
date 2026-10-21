import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useDocumentTitle } from './useDocumentTitle';

/**
 * Page shown for an unknown URL.
 * @returns The "not found" message with a link to the home page.
 */
export function NotFoundPage() {
  useDocumentTitle('Nie znaleziono strony');

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Nie znaleziono strony
      </Typography>
      <Typography>Ten adres nie istnieje.</Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Przejdź do strony głównej
      </Button>
    </Stack>
  );
}

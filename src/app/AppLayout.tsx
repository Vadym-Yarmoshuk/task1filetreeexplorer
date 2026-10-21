import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';
import { useTreeData } from '../store/useTreeData';
import { APP_NAME } from './useDocumentTitle';

/** Style for the active navigation link. */
const navButtonSx = {
  '&.active': { bgcolor: 'rgba(255, 255, 255, 0.16)' },
} as const;

/**
 * Page frame with the top bar and navigation. Views render inside it.
 * @returns The layout with the current view.
 */
export function AppLayout() {
  const { index, isPersisted } = useTreeData();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar component="nav" aria-label="Nawigacja główna" sx={{ gap: 1 }}>
          <AccountTreeIcon aria-hidden />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
          >
            {APP_NAME}
          </Typography>
          <Button color="inherit" component={NavLink} to="/" end sx={navButtonSx}>
            Wczytaj JSON
          </Button>
          <Button color="inherit" component={NavLink} to="/tree" disabled={!index} sx={navButtonSx}>
            Drzewo
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        {index && !isPersisted && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Drzewo jest za duże, aby zapisać je w przeglądarce. Po odświeżeniu strony trzeba je
            wczytać ponownie.
          </Alert>
        )}
        <Box>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}

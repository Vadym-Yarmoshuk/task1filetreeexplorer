import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { isRedirectState } from '../../app/redirectState';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { countGeneratedNodes, generateTree } from '../../domain/generateTree';
import type { TreeParseError } from '../../domain/parseTree';
import { NODE_FORMS, pluralize } from '../../domain/plural';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import { useTreeData } from '../../store/useTreeData';
import { FileDropzone } from './FileDropzone';

/** Shape of the large example tree, used to show virtualization. */
const LARGE_EXAMPLE = { depth: 4, foldersPerFolder: 10, filesPerFolder: 4 } as const;

/** Largest file the page accepts, in bytes. */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Error shown under the form. */
interface LoadError {
  title: string;
  error: TreeParseError;
}

/**
 * Home page: the user pastes or uploads JSON with a directory tree.
 * @returns The home page.
 */
export function HomePage() {
  useDocumentTitle(null);
  const { index, loadTree, clearTree } = useTreeData();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = isRedirectState(location.state) ? location.state.from : null;

  const [text, setText] = useState('');
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  /**
   * Loads JSON text and opens the tree, or shows the validation error.
   * @param json - JSON text to load.
   * @param errorTitle - Title of the error message.
   */
  const load = (json: string, errorTitle: string) => {
    const result = loadTree(json);
    if (!result.ok) {
      setLoadError({ title: errorTitle, error: result.error });
      return;
    }
    setLoadError(null);
    navigate(redirectFrom ?? '/tree');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    load(text, 'Nie można wczytać JSON');
  };

  const handleFile = async (file: File) => {
    const errorTitle = `Nie można wczytać pliku „${file.name}”`;
    if (file.size > MAX_FILE_SIZE) {
      setLoadError({ title: errorTitle, error: { message: 'Plik jest większy niż 50 MB.' } });
      return;
    }
    load(await file.text(), errorTitle);
  };

  const handleLargeExample = () => {
    load(JSON.stringify(generateTree(LARGE_EXAMPLE)), 'Nie można wczytać przykładu');
  };

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" component="h1" gutterBottom>
          Wczytaj strukturę katalogów
        </Typography>
        <Typography color="text.secondary">
          Wgraj plik JSON albo wklej jego treść. Każdy węzeł ma pola <code>name</code> i{' '}
          <code>type</code> (<code>file</code> albo <code>folder</code>). Plik ma pole{' '}
          <code>size</code> w bajtach, folder ma tablicę <code>children</code>.
        </Typography>
      </div>

      {redirectFrom && !index && (
        <Alert severity="info">
          Aby otworzyć <code>{redirectFrom}</code>, najpierw wczytaj drzewo.
        </Alert>
      )}

      {index && (
        <Alert
          severity="success"
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" component={RouterLink} to="/tree">
                Otwórz drzewo
              </Button>
              <Button color="inherit" size="small" onClick={() => setIsConfirmOpen(true)}>
                Wyczyść
              </Button>
            </Stack>
          }
        >
          Wczytane drzewo: <strong>{index.root.name}</strong> (
          {pluralize(index.nodes.size, NODE_FORMS)}). Nowy JSON zastąpi to drzewo.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <FileDropzone onFile={handleFile} />

          <Divider>albo wklej JSON</Divider>

          <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
            <TextField
              label="JSON"
              multiline
              minRows={10}
              maxRows={24}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder='{ "name": "root", "type": "folder", "children": [] }'
              slotProps={{
                htmlInput: { spellCheck: false, sx: { fontFamily: 'monospace', fontSize: 14 } },
              }}
            />

            {loadError && (
              <Alert severity="error" role="alert">
                <AlertTitle>{loadError.title}</AlertTitle>
                {loadError.error.message}
                {loadError.error.location && (
                  <>
                    {' '}
                    Miejsce: <code>{loadError.error.location}</code>
                  </>
                )}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button type="submit" variant="contained">
                Wczytaj
              </Button>
              <Button onClick={() => setText(JSON.stringify(SAMPLE_TREE, null, 2))}>
                Wstaw przykład
              </Button>
              <Button onClick={handleLargeExample}>
                Duży przykład ({pluralize(countGeneratedNodes(LARGE_EXAMPLE), NODE_FORMS)})
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Wyczyścić drzewo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wczytane drzewo zostanie usunięte z pamięci przeglądarki.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Anuluj</Button>
          <Button
            color="error"
            onClick={() => {
              clearTree();
              setIsConfirmOpen(false);
            }}
          >
            Wyczyść
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

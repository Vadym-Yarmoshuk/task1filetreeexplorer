import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { detailsUrl, treeUrl } from '../../app/routes';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { NodeIcon } from '../../components/NodeIcon';
import { formatSize } from '../../domain/formatSize';
import { ROOT_PATH, toDisplayPath } from '../../domain/paths';
import { pluralize, ITEM_FORMS } from '../../domain/plural';
import type { IndexedNode, TreeIndex } from '../../domain/types';
import { useTreeData } from '../../store/useTreeData';
import { DetailsList, type DetailsItem } from './DetailsList';
import { FolderChildren } from './FolderChildren';
import { NodeBreadcrumbs } from './NodeBreadcrumbs';
import { useNodePathParam } from './useNodePathParam';

/**
 * Details view of a file or a folder, selected by the encoded path in the URL.
 * @returns The details page, or a "not found" message.
 */
export function NodeDetailsPage() {
  const { index } = useTreeData();
  const path = useNodePathParam();
  // RequireTree renders this page only when a tree is loaded.
  const node = path === null || path === ROOT_PATH ? undefined : index!.nodes.get(path);
  useDocumentTitle(node ? node.name : 'Nie znaleziono węzła');

  if (!node) {
    return <NodeNotFound path={path} />;
  }
  return <NodeDetails index={index!} node={node} />;
}

/** Props for {@link NodeDetails}. */
interface NodeDetailsProps {
  index: TreeIndex;
  node: IndexedNode;
}

/**
 * Details of an existing node: header, properties, children (for a folder) and actions.
 * @param props - Component props.
 * @returns The details.
 */
function NodeDetails({ index, node }: NodeDetailsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isFolder = node.type === 'folder';
  const fullPath = toDisplayPath(index.root.name, node.path);

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(fullPath);
      setIsCopied(true);
    } catch {
      // Clipboard is not available (for example, no permission). The path is still visible.
    }
  };

  const pathValue = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Box component="code" sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
        {fullPath}
      </Box>
      <Tooltip title="Kopiuj ścieżkę">
        <IconButton size="small" aria-label="Kopiuj ścieżkę" onClick={copyPath}>
          <ContentCopyIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const items: DetailsItem[] = isFolder
    ? [
        { label: 'Nazwa', value: node.name },
        {
          label: 'Liczba bezpośrednich dzieci',
          value: pluralize(node.childPaths.length, ITEM_FORMS),
        },
        { label: 'Całkowity rozmiar', value: formatSizeWithBytes(node.size) },
        { label: 'Pełna ścieżka', value: pathValue },
      ]
    : [
        { label: 'Nazwa', value: node.name },
        { label: 'Rozmiar', value: formatSizeWithBytes(node.size) },
        { label: 'Pełna ścieżka', value: pathValue },
      ];

  return (
    <Stack spacing={3}>
      <NodeBreadcrumbs index={index} node={node} />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <NodeIcon type={node.type} fontSize="large" />
        <Typography variant="h4" component="h1" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>
          {node.name}
        </Typography>
        <Chip label={isFolder ? 'Folder' : 'Plik'} size="small" variant="outlined" />
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <DetailsList items={items} />
      </Paper>

      {isFolder && <FolderChildren index={index} folder={node} />}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant="outlined"
          startIcon={<AccountTreeIcon />}
          component={RouterLink}
          to={treeUrl(node.path)}
        >
          Pokaż w drzewie
        </Button>
        <Button
          startIcon={<ArrowUpwardIcon />}
          component={RouterLink}
          to={detailsUrl(node.parentPath!)}
        >
          Folder nadrzędny
        </Button>
      </Stack>

      <Snackbar
        open={isCopied}
        autoHideDuration={2000}
        onClose={() => setIsCopied(false)}
        message="Skopiowano ścieżkę"
      />
    </Stack>
  );
}

/**
 * Formats a size and adds the exact number of bytes when the short form is rounded.
 * @param bytes - Size in bytes.
 * @returns For example "1.5 KB (1 536 B)" or "300 B".
 */
function formatSizeWithBytes(bytes: number): string {
  const short = formatSize(bytes);
  return bytes < 1024 ? short : `${short} (${bytes.toLocaleString('pl-PL')} B)`;
}

/** Props for {@link NodeNotFound}. */
interface NodeNotFoundProps {
  /** Path from the URL, or null if the URL could not be decoded. */
  path: string | null;
}

/**
 * Message for a path that does not exist in the loaded tree.
 * @param props - Component props.
 * @returns The message with a link to the tree.
 */
function NodeNotFound({ path }: NodeNotFoundProps) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Nie znaleziono węzła
      </Typography>
      <Alert severity="warning">
        {path === null ? (
          'Adres zawiera niepoprawnie zakodowaną ścieżkę.'
        ) : (
          <>
            We wczytanym drzewie nie ma węzła <code>{path}</code>.
          </>
        )}
      </Alert>
      <Button variant="contained" component={RouterLink} to="/tree">
        Przejdź do drzewa
      </Button>
    </Stack>
  );
}

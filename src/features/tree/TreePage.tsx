import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detailsUrl, NODE_PARAM } from '../../app/routes';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { formatSize } from '../../domain/formatSize';
import { ROOT_PATH } from '../../domain/paths';
import { FILE_FORMS, FOLDER_FORMS, pluralize } from '../../domain/plural';
import type { TreeIndex } from '../../domain/types';
import { useTreeData } from '../../store/useTreeData';
import { SearchBar } from '../search/SearchBar';
import { SearchResults } from '../search/SearchResults';
import { useSearchQuery } from '../search/useSearchQuery';
import { useExpandedState } from './useExpandedState';
import { VirtualTree } from './VirtualTree';

/**
 * Tree page. Shows the loaded tree with expand, collapse and keyboard navigation.
 * @returns The tree page.
 */
export function TreePage() {
  const { index } = useTreeData();
  const [searchParams] = useSearchParams();
  const revealParam = searchParams.get(NODE_PARAM);
  // RequireTree renders this page only when a tree is loaded.
  const revealPath =
    revealParam !== null && index!.nodes.has(revealParam) ? revealParam : ROOT_PATH;
  // A new node to reveal mounts the view again, so it expands the ancestors and moves focus.
  // Expanded folders survive, because they are kept in sessionStorage.
  return <TreeView key={revealPath} index={index!} revealPath={revealPath} />;
}

/** Props for {@link TreeView}. */
interface TreeViewProps {
  index: TreeIndex;
  /** Path of the node to reveal and focus on mount. */
  revealPath: string;
}

/**
 * Content of the tree page for a loaded tree.
 * @param props - Component props.
 * @returns The tree header, toolbar and virtualized tree.
 */
function TreeView({ index, revealPath }: TreeViewProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useSearchQuery();
  const isSearching = query.trim() !== '';
  useDocumentTitle(isSearching ? `Szukaj: ${query.trim()}` : 'Drzewo');
  const expandedState = useExpandedState(index, revealPath);
  const [focusedPath, setFocusedPath] = useState(revealPath);

  const handleOpen = useCallback(
    (path: string) => {
      if (path === ROOT_PATH) {
        expandedState.toggle(path);
        return;
      }
      navigate(detailsUrl(path));
    },
    [expandedState, navigate],
  );

  const folderCount = useMemo(() => countFolders(index), [index]);

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h4" component="h1">
          Drzewo: {index.root.name}
        </Typography>
        <Typography color="text.secondary">
          {pluralize(index.nodes.size - folderCount, FILE_FORMS)},{' '}
          {pluralize(folderCount, FOLDER_FORMS)}, razem {formatSize(index.root.size)}
        </Typography>
      </div>

      <SearchBar query={query} onQueryChange={setQuery} />

      {isSearching && <SearchResults index={index} query={query} />}

      {/* Hidden, not removed, during search: the tree keeps its state and scroll position.
          A plain div is used because the hidden attribute does not override MUI display styles. */}
      <div hidden={isSearching}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Klawiatura: ↑ ↓ – ruch, → ← – rozwiń / zwiń, Enter – szczegóły, * – rozwiń poziom
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<UnfoldMoreIcon />} onClick={expandedState.expandAll}>
              Rozwiń wszystko
            </Button>
            <Button size="small" startIcon={<UnfoldLessIcon />} onClick={expandedState.collapseAll}>
              Zwiń wszystko
            </Button>
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            height: { xs: '60vh', md: 'calc(100vh - 360px)' },
            minHeight: 320,
            overflow: 'hidden',
          }}
        >
          <VirtualTree
            index={index}
            expandedState={expandedState}
            focusedPath={focusedPath}
            onFocusChange={setFocusedPath}
            onOpen={handleOpen}
            label={`Drzewo katalogów ${index.root.name}`}
          />
        </Paper>
      </div>
    </Stack>
  );
}

/**
 * Counts the folders in the tree, including the root.
 * @param index - Tree index.
 * @returns Number of folders.
 */
function countFolders(index: TreeIndex): number {
  let count = 0;
  for (const node of index.nodes.values()) {
    if (node.type === 'folder') {
      count++;
    }
  }
  return count;
}

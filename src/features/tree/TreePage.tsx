import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detailsUrl, NODE_PARAM } from '../../app/routes';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { formatSize } from '../../domain/formatSize';
import { getAncestorPaths, ROOT_PATH } from '../../domain/paths';
import { FILE_FORMS, FOLDER_FORMS, pluralize } from '../../domain/plural';
import type { TreeIndex } from '../../domain/types';
import { loadFocusedPath, saveFocusedPath } from '../../store/expandedStorage';
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
  // RequireTree renders this page only when a tree is loaded.
  return <TreeView index={index!} />;
}

/** Props for {@link TreeView}. */
interface TreeViewProps {
  index: TreeIndex;
}

/**
 * Returns the path to focus when the tree opens: the node from ?node=, else the node
 * focused before (for example before opening details), else the root.
 * @param index - Tree index.
 * @param revealPath - Valid path from ?node=, or null.
 * @returns Path of an existing node.
 */
function getInitialFocus(index: TreeIndex, revealPath: string | null): string {
  if (revealPath !== null) {
    return revealPath;
  }
  const saved = loadFocusedPath();
  return saved !== null && index.nodes.has(saved) ? saved : ROOT_PATH;
}

/**
 * Content of the tree page for a loaded tree.
 * @param props - Component props.
 * @returns The tree header, toolbar and virtualized tree.
 */
function TreeView({ index }: TreeViewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useSearchQuery();
  const isSearching = query.trim() !== '';
  useDocumentTitle(isSearching ? `Szukaj: ${query.trim()}` : 'Drzewo');

  const revealParam = searchParams.get(NODE_PARAM);
  const revealPath = revealParam !== null && index.nodes.has(revealParam) ? revealParam : null;
  const [initialFocus] = useState(() => getInitialFocus(index, revealPath));
  const expandedState = useExpandedState(index, initialFocus);
  const [focusedPath, setFocusedPath] = useState(initialFocus);
  const treeRef = useRef<HTMLDivElement>(null);
  const { expand } = expandedState;

  useEffect(() => {
    saveFocusedPath(focusedPath);
  }, [focusedPath]);

  // ?node= is a one-time command: reveal the node, move keyboard focus to the tree,
  // then remove the parameter, so "back" from details does not reveal the node again.
  useEffect(() => {
    if (revealParam === null) {
      return;
    }
    if (revealPath !== null) {
      expand(getAncestorPaths(revealPath));
      // Syncs state with a URL command. The parameter is removed below, so this runs once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFocusedPath(revealPath);
      treeRef.current?.focus();
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(NODE_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [revealParam, revealPath, expand, setSearchParams]);

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
            treeRef={treeRef}
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

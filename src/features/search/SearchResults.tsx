import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { detailsUrl, treeUrl } from '../../app/routes';
import { NodeIcon } from '../../components/NodeIcon';
import { VirtualList } from '../../components/VirtualList';
import { formatSize } from '../../domain/formatSize';
import { toDisplayPath } from '../../domain/paths';
import { pluralize, RESULT_FORMS } from '../../domain/plural';
import { findMatchRange, searchByName } from '../../domain/search';
import type { TreeIndex } from '../../domain/types';

/** Height of one result row in pixels. */
const ROW_HEIGHT = 60;

/** Largest height of the result list. Longer lists scroll (and are virtualized). */
const MAX_HEIGHT = 600;

/** Props for {@link SearchResults}. */
interface SearchResultsProps {
  index: TreeIndex;
  query: string;
}

/**
 * Search results for the whole tree: name with the match highlighted and the full path.
 * @param props - Component props.
 * @returns The result count and the list, or a "no results" message.
 */
export function SearchResults({ index, query }: SearchResultsProps) {
  const results = useMemo(() => searchByName(index, query), [index, query]);
  const rootName = index.root.name;

  return (
    <Stack spacing={1.5}>
      <Typography role="status" color="text.secondary">
        {results.length === 0 ? (
          <>Brak wyników dla „{query.trim()}”.</>
        ) : (
          <>
            Znaleziono {pluralize(results.length, RESULT_FORMS)} dla „{query.trim()}”.
          </>
        )}
      </Typography>

      {results.length === 0 ? (
        <Stack sx={{ alignItems: 'center', py: 4, color: 'text.secondary' }}>
          <SearchOffIcon fontSize="large" aria-hidden />
        </Stack>
      ) : (
        <Paper variant="outlined">
          <VirtualList
            items={results}
            rowHeight={ROW_HEIGHT}
            maxHeight={MAX_HEIGHT}
            getKey={(node) => node.path}
            label="Wyniki wyszukiwania"
            renderItem={(node) => (
              <Stack direction="row" sx={{ height: '100%', alignItems: 'center', pr: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={detailsUrl(node.path)}
                  sx={{ height: '100%', minWidth: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <NodeIcon type={node.type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<HighlightedText text={node.name} query={query} />}
                    secondary={`${toDisplayPath(rootName, node.path)} · ${formatSize(node.size)}`}
                    slotProps={{
                      primary: { noWrap: true },
                      secondary: { noWrap: true, title: toDisplayPath(rootName, node.path) },
                    }}
                  />
                </ListItemButton>
                <Tooltip title="Pokaż w drzewie">
                  <IconButton
                    component={RouterLink}
                    to={treeUrl(node.path)}
                    aria-label={`Pokaż w drzewie: ${node.name}`}
                  >
                    <AccountTreeOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          />
        </Paper>
      )}
    </Stack>
  );
}

/** Props for {@link HighlightedText}. */
interface HighlightedTextProps {
  text: string;
  query: string;
}

/**
 * Shows text with the first match of the query marked.
 * @param props - Component props.
 * @returns The text with a mark element around the match.
 */
function HighlightedText({ text, query }: HighlightedTextProps) {
  const range = findMatchRange(text, query);
  if (!range) {
    return text;
  }
  const [start, end] = range;
  return (
    <>
      {text.slice(0, start)}
      <Box
        component="mark"
        sx={{ bgcolor: 'warning.light', color: 'inherit', borderRadius: 0.5, px: 0.25 }}
      >
        {text.slice(start, end)}
      </Box>
      {text.slice(end)}
    </>
  );
}

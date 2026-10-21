import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { detailsUrl } from '../../app/routes';
import { NodeIcon } from '../../components/NodeIcon';
import { VirtualList } from '../../components/VirtualList';
import { formatSize } from '../../domain/formatSize';
import { ITEM_FORMS, pluralize } from '../../domain/plural';
import type { IndexedNode, TreeIndex } from '../../domain/types';

/** Height of one child row in pixels. */
const ROW_HEIGHT = 56;

/** Largest height of the list. Longer lists scroll (and are virtualized). */
const MAX_HEIGHT = 560;

/** Props for {@link FolderChildren}. */
interface FolderChildrenProps {
  index: TreeIndex;
  folder: IndexedNode;
}

/**
 * List of the direct children of a folder, with links to their details.
 * @param props - Component props.
 * @returns The children section.
 */
export function FolderChildren({ index, folder }: FolderChildrenProps) {
  const children = useMemo(
    () => folder.childPaths.map((path) => index.nodes.get(path)!),
    [index, folder],
  );

  return (
    <section aria-labelledby="folder-children-title">
      <Typography id="folder-children-title" variant="h6" component="h2" gutterBottom>
        Zawartość
      </Typography>
      {children.length === 0 ? (
        <Typography color="text.secondary">Folder jest pusty.</Typography>
      ) : (
        <Paper variant="outlined">
          <VirtualList
            items={children}
            rowHeight={ROW_HEIGHT}
            maxHeight={MAX_HEIGHT}
            getKey={(child) => child.path}
            label={`Zawartość folderu ${folder.name}`}
            renderItem={(child) => (
              <ListItemButton
                component={RouterLink}
                to={detailsUrl(child.path)}
                sx={{ height: '100%' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <NodeIcon type={child.type} />
                </ListItemIcon>
                <ListItemText
                  primary={child.name}
                  secondary={
                    child.type === 'folder'
                      ? `${pluralize(child.childPaths.length, ITEM_FORMS)} · ${formatSize(child.size)}`
                      : formatSize(child.size)
                  }
                  slotProps={{ primary: { noWrap: true, title: child.name } }}
                />
              </ListItemButton>
            )}
          />
        </Paper>
      )}
    </section>
  );
}

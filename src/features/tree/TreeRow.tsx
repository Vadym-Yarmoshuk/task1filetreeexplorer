import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { detailsUrl } from '../../app/routes';
import { formatSize } from '../../domain/formatSize';
import type { IndexedNode } from '../../domain/types';

/** Height of one row in pixels. The virtualizer needs a fixed value. */
export const ROW_HEIGHT = 36;

/** Indentation per level in pixels. */
const INDENT = 20;

/** Deeper levels get no extra indentation, so very deep trees stay readable. */
const MAX_INDENT_LEVEL = 30;

/** Props for {@link TreeRow}. */
interface TreeRowProps {
  /** DOM id, used by aria-activedescendant. */
  id: string;
  node: IndexedNode;
  /** Number of siblings, including the node (aria-setsize). */
  setSize: number;
  isExpanded: boolean;
  /** True for the row with keyboard focus. */
  isFocused: boolean;
  /** Vertical offset of the row in the scroll area, in pixels. */
  top: number;
  /** Called when the user clicks the row. */
  onRowClick: (node: IndexedNode) => void;
  /** Called when the user clicks the expand arrow of a folder. */
  onToggle: (path: string) => void;
}

/**
 * One row of the virtualized tree: arrow, icon, name, size and a link to the details.
 * @param props - Component props.
 * @returns The tree item.
 */
function TreeRowComponent({
  id,
  node,
  setSize,
  isExpanded,
  isFocused,
  top,
  onRowClick,
  onToggle,
}: TreeRowProps) {
  const isFolder = node.type === 'folder';
  const indent = Math.min(node.depth, MAX_INDENT_LEVEL) * INDENT;
  const FolderStateIcon = isExpanded ? FolderOpenIcon : FolderIcon;

  return (
    <ListItemButton
      id={id}
      role="treeitem"
      aria-label={`${node.name}, ${formatSize(node.size)}`}
      aria-level={node.depth + 1}
      aria-setsize={setSize}
      aria-posinset={node.position + 1}
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={isFocused}
      data-focused={isFocused}
      selected={isFocused}
      tabIndex={-1}
      // Keep DOM focus on the tree container (aria-activedescendant pattern).
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onRowClick(node)}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: ROW_HEIGHT,
        transform: `translateY(${top}px)`,
        pl: `${8 + indent}px`,
        pr: 1,
        py: 0,
        gap: 0.5,
      }}
    >
      <Box
        component="span"
        aria-hidden
        onClick={(event) => {
          if (isFolder) {
            event.stopPropagation();
            onToggle(node.path);
          }
        }}
        sx={{ display: 'inline-flex', width: 24, flexShrink: 0, color: 'text.secondary' }}
      >
        {isFolder && (
          <ChevronRightIcon
            fontSize="small"
            sx={{
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 150ms',
            }}
          />
        )}
      </Box>
      {isFolder ? (
        <FolderStateIcon fontSize="small" color="primary" aria-hidden />
      ) : (
        <InsertDriveFileOutlinedIcon fontSize="small" color="action" aria-hidden />
      )}
      <Typography noWrap title={node.name} sx={{ flexGrow: 1, minWidth: 0, ml: 0.5 }}>
        {node.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
        {formatSize(node.size)}
      </Typography>
      {node.parentPath !== null && (
        <IconButton
          size="small"
          component={RouterLink}
          to={detailsUrl(node.path)}
          tabIndex={-1}
          aria-label={`Szczegóły: ${node.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      )}
    </ListItemButton>
  );
}

/** Memoized row: only rows whose props change are rendered again. */
export const TreeRow = memo(TreeRowComponent);

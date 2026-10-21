import Box from '@mui/material/Box';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useId, useMemo, useRef, type KeyboardEvent } from 'react';
import { flattenVisible } from '../../domain/flattenVisible';
import { getAncestorPaths } from '../../domain/paths';
import type { IndexedNode, TreeIndex } from '../../domain/types';
import { getTreeKeyAction } from './treeKeyboard';
import { ROW_HEIGHT, TreeRow } from './TreeRow';
import type { ExpandedState } from './useExpandedState';

/** Number of rows rendered above and below the visible area. */
const OVERSCAN = 10;

/** Props for {@link VirtualTree}. */
interface VirtualTreeProps {
  index: TreeIndex;
  /** Expanded folders and the functions that change them. */
  expandedState: ExpandedState;
  /** Path of the node with keyboard focus. */
  focusedPath: string;
  /** Called when focus moves to another node. */
  onFocusChange: (path: string) => void;
  /** Called when the user opens a node (Enter, or a click on a file). */
  onOpen: (path: string) => void;
  /** Accessible name of the tree. */
  label: string;
}

/**
 * Finds the row to focus. If the focused node is hidden inside a collapsed folder,
 * returns the row of its nearest visible ancestor.
 * @param rowByPath - Row index of every visible node.
 * @param path - Path of the focused node.
 * @returns The row index.
 */
function resolveFocusedRow(rowByPath: ReadonlyMap<string, number>, path: string): number {
  const row = rowByPath.get(path);
  if (row !== undefined) {
    return row;
  }
  const ancestors = getAncestorPaths(path);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestorRow = rowByPath.get(ancestors[i]!);
    if (ancestorRow !== undefined) {
      return ancestorRow;
    }
  }
  return 0;
}

/**
 * Tree view that renders only the rows in the visible area, so it stays fast for large trees.
 * Supports keyboard navigation (WAI-ARIA Tree View) with aria-activedescendant.
 * @param props - Component props.
 * @returns The tree.
 */
export function VirtualTree({
  index,
  expandedState,
  focusedPath,
  onFocusChange,
  onOpen,
  label,
}: VirtualTreeProps) {
  const { expanded, toggle, expand, collapse } = expandedState;
  const idPrefix = useId();
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => flattenVisible(index, expanded), [index, expanded]);
  const rowByPath = useMemo(() => new Map(rows.map((node, row) => [node.path, row])), [rows]);
  const focusedRow = resolveFocusedRow(rowByPath, focusedPath);

  // The project does not use React Compiler. Rows get only plain numbers from the virtualizer.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  useEffect(() => {
    virtualizer.scrollToIndex(focusedRow, { align: 'auto' });
  }, [virtualizer, focusedRow]);

  const rowId = (row: number) => `${idPrefix}-row-${row}`;

  const handleRowClick = useCallback(
    (node: IndexedNode) => {
      onFocusChange(node.path);
      scrollRef.current?.focus();
      if (node.type === 'folder') {
        toggle(node.path);
      } else {
        onOpen(node.path);
      }
    },
    [onFocusChange, onOpen, toggle],
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const action = getTreeKeyAction(event.key, { rows, index, expanded, focusedRow });
    if (!action) {
      return;
    }
    event.preventDefault();
    switch (action.type) {
      case 'focus':
        onFocusChange(action.path);
        break;
      case 'expand':
        expand(action.paths);
        break;
      case 'collapse':
        collapse(action.path);
        break;
      case 'toggle':
        toggle(action.path);
        break;
      case 'open':
        onOpen(action.path);
        break;
    }
  };

  return (
    <Box
      ref={scrollRef}
      role="tree"
      aria-label={label}
      aria-activedescendant={rows.length > 0 ? rowId(focusedRow) : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      sx={{
        height: '100%',
        overflow: 'auto',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}`,
        },
        '&:focus [data-focused="true"]': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px',
        },
      }}
    >
      <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => {
          const node = rows[item.index]!;
          const parent = node.parentPath === null ? null : index.nodes.get(node.parentPath)!;
          return (
            <TreeRow
              key={node.path}
              id={rowId(item.index)}
              node={node}
              setSize={parent ? parent.childPaths.length : 1}
              isExpanded={expanded.has(node.path)}
              isFocused={item.index === focusedRow}
              top={item.start}
              onRowClick={handleRowClick}
              onToggle={toggle}
            />
          );
        })}
      </Box>
    </Box>
  );
}

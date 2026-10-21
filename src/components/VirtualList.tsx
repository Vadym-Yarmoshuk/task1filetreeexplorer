import Box from '@mui/material/Box';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, type ReactNode } from 'react';

/** Props for {@link VirtualList}. */
interface VirtualListProps<T> {
  items: readonly T[];
  /** Fixed height of one row in pixels. */
  rowHeight: number;
  /** Largest height of the list in pixels. A shorter list is not padded. */
  maxHeight: number;
  /** Gives a stable React key for an item. */
  getKey: (item: T) => string;
  /** Renders the content of one row. */
  renderItem: (item: T) => ReactNode;
  /** Accessible name of the list. */
  label: string;
}

/** Number of rows rendered above and below the visible area. */
const OVERSCAN = 8;

/**
 * List that renders only the rows in the visible area. Used for long lists:
 * children of a folder and search results.
 * @param props - Component props.
 * @returns The scrollable list.
 */
export function VirtualList<T>({
  items,
  rowHeight,
  maxHeight,
  getKey,
  renderItem,
  label,
}: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // The project does not use React Compiler. Rows get only plain numbers from the virtualizer.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: OVERSCAN,
  });

  return (
    <Box
      ref={scrollRef}
      sx={{ height: Math.min(items.length * rowHeight, maxHeight), overflow: 'auto' }}
    >
      <Box
        role="list"
        aria-label={label}
        sx={{ height: virtualizer.getTotalSize(), position: 'relative', m: 0, p: 0 }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]!;
          return (
            <Box
              key={getKey(item)}
              role="listitem"
              aria-setsize={items.length}
              aria-posinset={virtualItem.index + 1}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: rowHeight,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

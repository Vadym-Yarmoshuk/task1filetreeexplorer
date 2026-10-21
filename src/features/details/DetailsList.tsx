import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

/** One term and its value. */
export interface DetailsItem {
  label: string;
  value: ReactNode;
}

/** Props for {@link DetailsList}. */
interface DetailsListProps {
  items: readonly DetailsItem[];
}

/**
 * Description list (dl) with labels on the left and values on the right.
 * On narrow screens each value goes under its label.
 * @param props - Component props.
 * @returns The description list.
 */
export function DetailsList({ items }: DetailsListProps) {
  return (
    <Box
      component="dl"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(160px, max-content) 1fr' },
        columnGap: 3,
        rowGap: { xs: 0.5, sm: 1.5 },
        m: 0,
      }}
    >
      {items.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" color="text.secondary" sx={{ mt: { xs: 1, sm: 0 } }}>
            {label}
          </Typography>
          <Typography component="dd" sx={{ m: 0, minWidth: 0, overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

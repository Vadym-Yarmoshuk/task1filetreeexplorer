import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { detailsUrl } from '../../app/routes';
import { getAncestorPaths } from '../../domain/paths';
import type { IndexedNode, TreeIndex } from '../../domain/types';

/** Props for {@link NodeBreadcrumbs}. */
interface NodeBreadcrumbsProps {
  index: TreeIndex;
  node: IndexedNode;
}

/**
 * Links to every folder on the path from the root to the node.
 * The root links to the tree view. Long paths are collapsed by MUI.
 * @param props - Component props.
 * @returns The breadcrumbs.
 */
export function NodeBreadcrumbs({ index, node }: NodeBreadcrumbsProps) {
  return (
    <Breadcrumbs aria-label="Ścieżka" maxItems={8} itemsBeforeCollapse={2} itemsAfterCollapse={4}>
      {getAncestorPaths(node.path).map((path) => (
        <Link
          key={path}
          component={RouterLink}
          to={detailsUrl(path)}
          underline="hover"
          color="inherit"
        >
          {index.nodes.get(path)!.name}
        </Link>
      ))}
      <Typography color="text.primary" aria-current="page">
        {node.name}
      </Typography>
    </Breadcrumbs>
  );
}

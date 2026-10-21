import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { NodeType } from '../domain/types';

/** Props for {@link NodeIcon}. */
interface NodeIconProps {
  type: NodeType;
  fontSize?: SvgIconProps['fontSize'];
}

/**
 * Decorative icon for a file or a folder.
 * @param props - Component props.
 * @returns The icon.
 */
export function NodeIcon({ type, fontSize = 'small' }: NodeIconProps) {
  return type === 'folder' ? (
    <FolderIcon fontSize={fontSize} color="primary" aria-hidden />
  ) : (
    <InsertDriveFileOutlinedIcon fontSize={fontSize} color="action" aria-hidden />
  );
}

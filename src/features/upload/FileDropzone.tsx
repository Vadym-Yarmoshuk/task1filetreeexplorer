import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useRef, useState, type DragEvent } from 'react';

/** Props for {@link FileDropzone}. */
interface FileDropzoneProps {
  /** Called with the file the user dropped or selected. */
  onFile: (file: File) => void;
}

/**
 * Area where the user drops a JSON file, with a button that opens the file dialog.
 * @param props - Component props.
 * @returns The drop area.
 */
export function FileDropzone({ onFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      onFile(file);
    }
  };

  return (
    <Box
      data-testid="file-dropzone"
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: 2,
        borderStyle: 'dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        bgcolor: isDragging ? 'action.hover' : 'transparent',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        transition: 'border-color 150ms, background-color 150ms',
      }}
    >
      <UploadFileIcon fontSize="large" color="action" aria-hidden />
      <Typography sx={{ mt: 1, mb: 2 }}>Przeciągnij tutaj plik .json albo</Typography>
      <Button variant="outlined" onClick={() => inputRef.current?.click()}>
        Wybierz plik
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        aria-label="Plik JSON"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFile(file);
          }
          // Allow selecting the same file again.
          event.target.value = '';
        }}
      />
    </Box>
  );
}

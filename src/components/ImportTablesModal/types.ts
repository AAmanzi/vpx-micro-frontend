import { FileSystemItem, TableFile } from 'src/types/file';

export interface ImportSelectionResult {
  tablesToImport: Array<TableFile>;
  unassignedRoms: Array<FileSystemItem>;
}

export interface Props {
  onClose: () => void;
  initialFiles?: Array<FileSystemItem>;
}

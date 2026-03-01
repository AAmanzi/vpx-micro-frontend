import { FileSystemItem, TableFile } from 'src/types/file';
import { Table } from 'src/types/table';

export interface ImportSelectionResult {
  tablesToImport: Array<TableFile>;
  unassignedRoms: Array<FileSystemItem>;
}

export interface Props {
  onClose: () => void;
}

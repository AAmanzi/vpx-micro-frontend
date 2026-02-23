import { FileSystemItem } from 'src/types/file';

export interface ImportSelectionResult {
  tablesToImport: Array<TableFile>;
  unassignedRoms: Array<FileSystemItem>;
}

export interface TableFile {
  name: string;
  filePath: string;
  fileName: string;
  rom?: FileSystemItem;
  expectedRomName?: string;
}

export interface Props {
  onClose: () => void;
}

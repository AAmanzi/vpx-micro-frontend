import { FileSystemItem, TableFile } from 'src/types/file';

export interface ImportSelectionResult {
  tablesToImport: Array<TableFile>;
  unassignedRoms: Array<FileSystemItem>;
  unassignedBackglasses: Array<FileSystemItem>;
  existingTableBackglasses: Array<ExistingTableBackglass>;
}

export interface ExistingTableBackglass {
  tableId: string;
  tableName: string;
  vpxFileName: string;
  backglass: FileSystemItem;
}

export interface Props {
  onClose: () => void;
  initialFiles?: Array<FileSystemItem>;
}

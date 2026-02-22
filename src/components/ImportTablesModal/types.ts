import { FileSystemItem } from 'src/types/file';

export interface TableFile {
  name: string;
  filePath: string;
  fileName: string;
  rom?: FileSystemItem;
}

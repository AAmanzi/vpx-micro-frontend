import { FileSystemItem } from 'src/types/file';

export interface Props {
  label: string;
  description: string;
  acceptedExtensions: string[];
  acceptFolders?: boolean;
  onFilesSelected: (files: Array<FileSystemItem>) => void;
}

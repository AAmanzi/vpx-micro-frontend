import { FileSystemItem } from 'src/types/file';

export interface Props {
  label: string;
  description: string;
  acceptedExtensions: string[];
  acceptFolders?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onFilesSelected: (files: Array<FileSystemItem>) => void;
}

export interface Props {
  label: string;
  description: string;
  acceptedExtensions: string[];
  acceptFolders?: boolean;
  onFilesSelected: (files: FileSystemItem[]) => void;
}

export interface FileSystemItem {
  path: string;
  isDirectory: boolean;
  name: string;
}

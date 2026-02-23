export interface FileSystemItem {
  path: string;
  name: string;
  children?: Array<FileSystemItem>;
}

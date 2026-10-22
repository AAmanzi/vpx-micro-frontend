export interface FileSystemItem {
  path: string;
  name: string;
}

export interface TableFile {
  name: string;
  filePath: string;
  fileName: string;
  rom?: FileSystemItem;
  expectedRomName?: string;
  backglass?: FileSystemItem;
  ini?: FileSystemItem;
}

export interface BackglassImportAssignment {
  tableId: string;
  backglass: FileSystemItem;
}

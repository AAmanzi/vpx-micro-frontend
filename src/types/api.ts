import { Config } from './config';
import { FileSystemItem, TableFile } from './file';
import { Table } from './table';

export interface Api {
  // Tables
  getAllTables: () => Promise<Array<Table>>;
  setTableFavorite: (id: string, fav: boolean) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  renameTable: (id: string, newName: string) => Promise<void>;
  importTables: (
    tables: Array<TableFile>,
    deleteAfterImport: boolean,
  ) => Promise<void>;
  startTable: (tableId: string) => Promise<void>;

  // FileSystem
  getPathForFile: (file: File) => string;
  getDirectoryTree: (
    directoryPath: string,
    acceptedExtensions: string[],
  ) => Promise<Array<FileSystemItem>>;
  getExpectedRomName: (vpxFilePath: string) => Promise<string | null>;

  // Config
  getConfig: () => Promise<Config>;
  updateVpxRootPath: (path: string) => Promise<void>;
  updateRomsDirectoryPath: (path: string) => Promise<void>;
  updateTablesDirectoryPath: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    api: Api;
  }
}

export {};

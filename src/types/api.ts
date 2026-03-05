import { Config } from './config';
import { FileSystemItem, TableFile } from './file';
import { ScanResult, Table } from './table';

export interface ApiError {
  code: string;
  message?: string;
}

export type ApiResult<T> =
  | {
      success: true;
      data: T;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: ApiError;
    };

export interface Api {
  // Tables
  getAllTables: () => Promise<ApiResult<Array<Table>>>;
  setTableFavorite: (id: string, fav: boolean) => Promise<ApiResult<null>>;
  deleteTable: (id: string) => Promise<ApiResult<null>>;
  renameTable: (id: string, newName: string) => Promise<ApiResult<null>>;
  importTables: (
    tables: Array<TableFile>,
    deleteAfterImport: boolean,
  ) => Promise<ApiResult<null>>;
  startTable: (tableId: string) => Promise<ApiResult<null>>;
  clearTables: () => Promise<ApiResult<null>>;
  scanVpxLibrary: () => Promise<ApiResult<ScanResult>>;
  applyScanResult: (scanResult: ScanResult) => Promise<ApiResult<null>>;
  exportTables: (destinationPath: string) => Promise<ApiResult<null>>;

  // FileSystem
  getPathForFile: (file: File) => ApiResult<string>;
  getDirectoryTree: (
    directoryPath: string,
    acceptedExtensions: string[],
  ) => Promise<ApiResult<Array<FileSystemItem>>>;
  getExpectedRomName: (
    vpxFilePath: string,
  ) => Promise<ApiResult<string | null>>;

  // Config
  getConfig: () => Promise<ApiResult<Config>>;
  updateVpxRootPath: (path: string) => Promise<ApiResult<null>>;
  updateRomsDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  updateTablesDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  updateDeleteFilesAfterImport: (
    deleteAfterImport: boolean,
  ) => Promise<ApiResult<null>>;
}

declare global {
  interface Window {
    api: Api;
  }
}

export {};

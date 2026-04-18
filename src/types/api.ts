import { Config } from './config';
import { FileSystemItem, TableFile } from './file';
import { GroupType, ScanResult, Table } from './table';

export interface ApiError {
  code: string;
  message?: string;
}

export interface ApiWarning {
  code: string;
  message?: string;
}

export type ApiResult<T> =
  | {
      success: true;
      data: T;
      error?: never;
      warning?: ApiWarning;
    }
  | {
      success: false;
      data?: never;
      error: ApiError;
      warning?: never;
    };

export interface Api {
  // Tables
  getAllTables: () => Promise<ApiResult<Array<Table>>>;
  setTableFavorite: (id: string, fav: boolean) => Promise<ApiResult<null>>;
  setTableForAndroid: (
    id: string,
    isForAndroid: boolean,
  ) => Promise<ApiResult<null>>;
  setTableArchived: (id: string, archived: boolean) => Promise<ApiResult<null>>;
  deleteTable: (id: string) => Promise<ApiResult<null>>;
  renameTable: (id: string, newName: string) => Promise<ApiResult<null>>;
  getUnmatchedRoms: () => Promise<ApiResult<Array<FileSystemItem>>>;
  updateTableRom: (
    tableId: string,
    rom: FileSystemItem | null,
  ) => Promise<ApiResult<null>>;
  updateTableVpxExecutablePath: (
    tableId: string,
    executablePath: string | null,
  ) => Promise<ApiResult<null>>;
  importTables: (
    tables: Array<TableFile>,
    deleteAfterImport: boolean,
  ) => Promise<ApiResult<null>>;
  startTable: (tableId: string) => Promise<ApiResult<null>>;
  clearTables: () => Promise<ApiResult<null>>;
  scanVpxLibrary: () => Promise<ApiResult<ScanResult>>;
  applyScanResult: (scanResult: ScanResult) => Promise<ApiResult<null>>;
  exportTables: (
    destinationPath: string,
    exportGroup: GroupType,
  ) => Promise<ApiResult<null>>;
  startRandomTable: (tables: Array<Table>) => Promise<ApiResult<null>>;

  // FileSystem
  getPathForFile: (file: File) => ApiResult<string>;
  openDirectoryPicker: () => Promise<ApiResult<string | null>>;
  openFilePicker: (
    acceptedExtensions: string[],
    acceptFolders?: boolean,
  ) => Promise<ApiResult<Array<FileSystemItem>>>;
  openPath: (path: string) => Promise<ApiResult<null>>;
  openExternalUrl: (url: string) => Promise<ApiResult<null>>;
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
  updateVpxExecutablePath: (path: string) => Promise<ApiResult<null>>;
  updateDeleteFilesAfterImport: (
    deleteAfterImport: boolean,
  ) => Promise<ApiResult<null>>;
  updateKeepFavoritesOnTop: (
    keepFavoritesOnTop: boolean,
  ) => Promise<ApiResult<null>>;
  updateAndroidFeaturesEnabled: (
    androidFeaturesEnabled: boolean,
  ) => Promise<ApiResult<null>>;
  updateOrder: (order: Config['order']) => Promise<ApiResult<null>>;
  updateViewType: (viewType: Config['viewType']) => Promise<ApiResult<null>>;
}

declare global {
  interface Window {
    api: Api;
  }
}

export {};

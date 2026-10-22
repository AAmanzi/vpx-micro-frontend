import {
  AndroidScanResult,
  AndroidSyncApplyPayload,
  AndroidSyncProgressEvent,
} from './android';
import { Config, LaunchFlags, Platform } from './config';
import { BackglassImportAssignment, FileSystemItem, TableFile } from './file';
import { IniBackup, IniBackupList, TableConfigDeletion } from './iniBackup';
import { GroupType, ResolvedTable, ScanResult } from './table';
import { AvailableUpdate } from './updates';

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
  getAvailableUpdate: () => Promise<ApiResult<AvailableUpdate | null>>;
  dismissUpdateNotice: () => Promise<ApiResult<null>>;

  // Tables
  getAllTables: () => Promise<ApiResult<Array<ResolvedTable>>>;
  setTableFavorite: (id: string, fav: boolean) => Promise<ApiResult<null>>;
  setTableForAndroid: (
    id: string,
    isForAndroid: boolean,
  ) => Promise<ApiResult<null>>;
  setTableArchived: (id: string, archived: boolean) => Promise<ApiResult<null>>;
  deleteTable: (
    id: string,
    options?: { deleteActiveConfig?: boolean },
  ) => Promise<ApiResult<null>>;
  getTableConfigDeletion: (
    id: string,
  ) => Promise<ApiResult<TableConfigDeletion>>;
  renameTable: (id: string, newName: string) => Promise<ApiResult<null>>;
  updateTableBackglass: (
    tableId: string,
    backglass: FileSystemItem | null,
  ) => Promise<ApiResult<null>>;
  updateTableRom: (
    tableId: string,
    rom: FileSystemItem | null,
  ) => Promise<ApiResult<null>>;
  updateTableVpxExecutablePath: (
    tableId: string,
    executablePath: string | null,
  ) => Promise<ApiResult<null>>;
  getTableImageCandidates: (
    tableId: string,
  ) => Promise<ApiResult<Array<string>>>;
  updateTableLaunchFlags: (
    tableId: string,
    launchFlags: Partial<LaunchFlags> | null,
  ) => Promise<ApiResult<null>>;
  updateLaunchFlags: (launchFlags: LaunchFlags) => Promise<ApiResult<null>>;
  updateTableImage: (
    tableId: string,
    imgUrl: string,
  ) => Promise<ApiResult<null>>;
  clearTableImage: (tableId: string) => Promise<ApiResult<null>>;
  importTables: (
    tables: Array<TableFile>,
    deleteAfterImport: boolean,
    existingTableBackglasses?: Array<BackglassImportAssignment>,
  ) => Promise<ApiResult<null>>;
  startTable: (tableId: string) => Promise<ApiResult<null>>;
  getIniBackups: (tableId: string) => Promise<ApiResult<IniBackupList>>;
  createIniBackup: (
    tableId: string,
    name?: string,
  ) => Promise<ApiResult<IniBackup>>;
  restoreIniBackup: (
    tableId: string,
    backupId: string,
  ) => Promise<ApiResult<boolean>>;
  renameCurrentIni: (tableId: string, name: string) => Promise<ApiResult<null>>;
  deleteCurrentIni: (tableId: string) => Promise<ApiResult<null>>;
  renameIniBackup: (
    tableId: string,
    backupId: string,
    name: string,
  ) => Promise<ApiResult<IniBackup>>;
  deleteIniBackup: (
    tableId: string,
    backupId: string,
  ) => Promise<ApiResult<null>>;
  clearTables: () => Promise<ApiResult<null>>;
  scanVpxLibrary: () => Promise<ApiResult<ScanResult>>;
  applyScanResult: (scanResult: ScanResult) => Promise<ApiResult<null>>;
  exportTables: (
    destinationPath: string,
    exportGroup: GroupType,
  ) => Promise<ApiResult<null>>;
  startRandomTable: (tables: Array<ResolvedTable>) => Promise<ApiResult<null>>;

  // Android Sync
  scanAndroidLibrary: () => Promise<ApiResult<AndroidScanResult>>;
  applyAndroidSync: (
    payload: AndroidSyncApplyPayload,
  ) => Promise<ApiResult<null>>;
  onAndroidSyncProgress: (
    callback: (event: AndroidSyncProgressEvent) => void,
  ) => () => void;

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

  // Window
  isFullScreen: () => Promise<ApiResult<boolean>>;
  setFullScreen: (fullScreen: boolean) => Promise<ApiResult<null>>;
  onFullScreenChanged: (
    callback: (isFullScreen: boolean) => void,
  ) => () => void;

  // Config
  getPlatform: () => Promise<ApiResult<Platform>>;
  getConfig: () => Promise<ApiResult<Config>>;
  updateVpxRootPath: (path: string) => Promise<ApiResult<null>>;
  updateRomsDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  updateTablesDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  setupDefaultLibraryFolders: (
    libraryFolder: string,
  ) => Promise<ApiResult<null>>;
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
  updateAndroidWebServerUrl: (path: string) => Promise<ApiResult<null>>;
  updateAndroidTablesDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  updateAndroidRomsDirectoryPath: (path: string) => Promise<ApiResult<null>>;
  updateOrder: (order: Config['order']) => Promise<ApiResult<null>>;
  updateViewType: (viewType: Config['viewType']) => Promise<ApiResult<null>>;
}

declare global {
  interface Window {
    api: Api;
  }
}

export {};

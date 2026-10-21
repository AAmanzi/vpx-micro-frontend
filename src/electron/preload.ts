import { contextBridge, ipcRenderer, webUtils } from 'electron';

import type {
  AndroidScanResult,
  AndroidSyncApplyPayload,
  AndroidSyncProgressEvent,
} from 'src/types/android';
import type { Api, ApiResult } from 'src/types/api';
import type { Config, LaunchFlags, Platform } from 'src/types/config';
import type { FileSystemItem } from 'src/types/file';
import type {
  IniBackup,
  IniBackupList,
  TableConfigDeletion,
} from 'src/types/iniBackup';
import type { GroupType, ResolvedTable, ScanResult } from 'src/types/table';
import type { AvailableUpdate } from 'src/types/updates';

const invoke = <T>(channel: string, ...args: any[]): Promise<T> =>
  ipcRenderer.invoke(channel, ...args);

const frontendApi: Api = {
  getAvailableUpdate: () =>
    invoke<ApiResult<AvailableUpdate | null>>('api:getAvailableUpdate'),
  dismissUpdateNotice: () => invoke<ApiResult<null>>('api:dismissUpdateNotice'),
  getAllTables: (): Promise<ApiResult<ResolvedTable[]>> =>
    invoke<ApiResult<ResolvedTable[]>>('api:getAllTables'),
  setTableFavorite: (id: string, fav: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableFavorite', id, fav),
  setTableForAndroid: (
    id: string,
    isForAndroid: boolean,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableForAndroid', id, isForAndroid),
  setTableArchived: (id: string, archived: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableArchived', id, archived),
  deleteTable: (
    id: string,
    options?: { deleteActiveConfig?: boolean },
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:deleteTable', id, options),
  getTableConfigDeletion: (id: string) =>
    invoke<ApiResult<TableConfigDeletion>>('api:getTableConfigDeletion', id),
  renameTable: (id: string, newName: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:renameTable', id, newName),
  updateTableBackglass: (
    tableId: string,
    backglass: FileSystemItem | null,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTableBackglass', tableId, backglass),
  updateTableRom: (
    tableId: string,
    rom: FileSystemItem | null,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTableRom', tableId, rom),
  updateTableVpxExecutablePath: (
    tableId: string,
    executablePath: string | null,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>(
      'api:updateTableVpxExecutablePath',
      tableId,
      executablePath,
    ),
  getTableImageCandidates: (
    tableId: string,
  ): Promise<ApiResult<Array<string>>> =>
    invoke<ApiResult<Array<string>>>('api:getTableImageCandidates', tableId),
  updateTableLaunchFlags: (
    tableId: string,
    launchFlags: Partial<LaunchFlags> | null,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTableLaunchFlags', tableId, launchFlags),
  updateLaunchFlags: (launchFlags: LaunchFlags): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateLaunchFlags', launchFlags),
  updateTableImage: (
    tableId: string,
    imgUrl: string,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTableImage', tableId, imgUrl),
  clearTableImage: (tableId: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:clearTableImage', tableId),
  getExpectedRomName: (
    vpxFilePath: string,
  ): Promise<ApiResult<string | null>> =>
    invoke<ApiResult<string | null>>('api:getExpectedRomName', vpxFilePath),
  getPathForFile: (file: File): ApiResult<string> => {
    try {
      return {
        success: true,
        data: webUtils.getPathForFile(file),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILE_PATH_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to resolve file path',
        },
      };
    }
  },
  openDirectoryPicker: (): Promise<ApiResult<string | null>> =>
    invoke<ApiResult<string | null>>('api:openDirectoryPicker'),
  openFilePicker: (
    acceptedExtensions: string[],
    acceptFolders = true,
  ): Promise<ApiResult<Array<FileSystemItem>>> =>
    invoke<ApiResult<Array<FileSystemItem>>>(
      'api:openFilePicker',
      acceptedExtensions,
      acceptFolders,
    ),
  openPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:openPath', path),
  openExternalUrl: (url: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:openExternalUrl', url),
  getDirectoryTree: (
    directoryPath: string,
    acceptedExtensions: string[],
  ): Promise<ApiResult<Array<FileSystemItem>>> =>
    invoke<ApiResult<Array<FileSystemItem>>>(
      'api:getDirectoryTree',
      directoryPath,
      acceptedExtensions,
    ),
  importTables: (
    tables,
    deleteAfterImport,
    existingTableBackglasses,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>(
      'api:importTables',
      tables,
      deleteAfterImport,
      existingTableBackglasses,
    ),
  clearTables: (): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:clearTables'),
  scanVpxLibrary: (): Promise<ApiResult<ScanResult>> =>
    invoke<ApiResult<ScanResult>>('api:scanVpxLibrary'),
  scanAndroidLibrary: (): Promise<ApiResult<AndroidScanResult>> =>
    invoke<ApiResult<AndroidScanResult>>('api:scanAndroidLibrary'),
  applyAndroidSync: (
    payload: AndroidSyncApplyPayload,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:applyAndroidSync', payload),
  onAndroidSyncProgress: (
    callback: (event: AndroidSyncProgressEvent) => void,
  ): (() => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      data: AndroidSyncProgressEvent,
    ) => callback(data);
    ipcRenderer.on('event:androidSyncProgress', handler);
    return () =>
      ipcRenderer.removeListener('event:androidSyncProgress', handler);
  },
  applyScanResult: (scanResult: ScanResult): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:applyScanResult', scanResult),
  exportTables: (
    destinationPath: string,
    exportGroup: GroupType,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:exportTables', destinationPath, exportGroup),
  isFullScreen: (): Promise<ApiResult<boolean>> =>
    invoke<ApiResult<boolean>>('api:isFullScreen'),
  setFullScreen: (fullScreen: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setFullScreen', fullScreen),
  onFullScreenChanged: (callback: (isFullScreen: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, value: boolean) =>
      callback(value);
    ipcRenderer.on('event:fullScreenChanged', handler);
    return () => ipcRenderer.removeListener('event:fullScreenChanged', handler);
  },
  getPlatform: (): Promise<ApiResult<Platform>> =>
    invoke<ApiResult<Platform>>('api:getPlatform'),
  getConfig: (): Promise<ApiResult<Config>> =>
    invoke<ApiResult<Config>>('api:getConfig'),
  updateVpxRootPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateVpxRootPath', path),
  updateRomsDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateRomsDirectoryPath', path),
  updateTablesDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTablesDirectoryPath', path),
  setupDefaultLibraryFolders: (
    libraryFolder: string,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setupDefaultLibraryFolders', libraryFolder),
  updateVpxExecutablePath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateVpxExecutablePath', path),
  updateDeleteFilesAfterImport: (
    deleteAfterImport: boolean,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>(
      'api:updateDeleteFilesAfterImport',
      deleteAfterImport,
    ),
  updateKeepFavoritesOnTop: (
    keepFavoritesOnTop: boolean,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateKeepFavoritesOnTop', keepFavoritesOnTop),
  updateAndroidFeaturesEnabled: (
    androidFeaturesEnabled: boolean,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>(
      'api:updateAndroidFeaturesEnabled',
      androidFeaturesEnabled,
    ),
  updateAndroidWebServerUrl: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateAndroidWebServerUrl', path),
  updateAndroidTablesDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateAndroidTablesDirectoryPath', path),
  updateAndroidRomsDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateAndroidRomsDirectoryPath', path),
  updateOrder: (order: Config['order']): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateOrder', order),
  updateViewType: (viewType: Config['viewType']): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateViewType', viewType),
  startTable: (tableId: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:startTable', tableId),
  getIniBackups: (tableId: string) =>
    invoke<ApiResult<IniBackupList>>('api:getIniBackups', tableId),
  createIniBackup: (tableId: string, name?: string) =>
    invoke<ApiResult<IniBackup>>('api:createIniBackup', tableId, name),
  restoreIniBackup: (tableId: string, backupId: string) =>
    invoke<ApiResult<boolean>>('api:restoreIniBackup', tableId, backupId),
  renameCurrentIni: (tableId: string, name: string) =>
    invoke<ApiResult<null>>('api:renameCurrentIni', tableId, name),
  deleteCurrentIni: (tableId: string) =>
    invoke<ApiResult<null>>('api:deleteCurrentIni', tableId),
  renameIniBackup: (tableId: string, backupId: string, name: string) =>
    invoke<ApiResult<IniBackup>>(
      'api:renameIniBackup',
      tableId,
      backupId,
      name,
    ),
  deleteIniBackup: (tableId: string, backupId: string) =>
    invoke<ApiResult<null>>('api:deleteIniBackup', tableId, backupId),
  startRandomTable: (tables: ResolvedTable[]): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:startRandomTable', tables),
};

contextBridge.exposeInMainWorld('api', frontendApi);

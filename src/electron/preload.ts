import { contextBridge, ipcRenderer, webUtils } from 'electron';

import type { Api, ApiResult } from 'src/types/api';
import type { AndroidScanResult, AndroidSyncApplyPayload, AndroidSyncProgressEvent } from 'src/types/android';
import type { Config } from 'src/types/config';
import type { FileSystemItem } from 'src/types/file';
import type { GroupType, ScanResult, Table } from 'src/types/table';

const invoke = <T>(channel: string, ...args: any[]): Promise<T> =>
  ipcRenderer.invoke(channel, ...args);

const frontendApi: Api = {
  getAllTables: (): Promise<ApiResult<Table[]>> =>
    invoke<ApiResult<Table[]>>('api:getAllTables'),
  setTableFavorite: (id: string, fav: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableFavorite', id, fav),
  setTableForAndroid: (
    id: string,
    isForAndroid: boolean,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableForAndroid', id, isForAndroid),
  setTableArchived: (id: string, archived: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableArchived', id, archived),
  deleteTable: (id: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:deleteTable', id),
  renameTable: (id: string, newName: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:renameTable', id, newName),
  getUnmatchedRoms: (): Promise<ApiResult<Array<FileSystemItem>>> =>
    invoke<ApiResult<Array<FileSystemItem>>>('api:getUnmatchedRoms'),
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
  importTables: (tables, deleteAfterImport): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:importTables', tables, deleteAfterImport),
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
    return () => ipcRenderer.removeListener('event:androidSyncProgress', handler);
  },
  applyScanResult: (scanResult: ScanResult): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:applyScanResult', scanResult),
  exportTables: (
    destinationPath: string,
    exportGroup: GroupType,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:exportTables', destinationPath, exportGroup),
  getConfig: (): Promise<ApiResult<Config>> =>
    invoke<ApiResult<Config>>('api:getConfig'),
  updateVpxRootPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateVpxRootPath', path),
  updateRomsDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateRomsDirectoryPath', path),
  updateTablesDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTablesDirectoryPath', path),
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
  updateAndroidTablesDirectoryPath: (
    path: string,
  ): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateAndroidTablesDirectoryPath', path),
  updateAndroidRomsDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateAndroidRomsDirectoryPath', path),
  updateOrder: (order: Config['order']): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateOrder', order),
  updateViewType: (viewType: Config['viewType']): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateViewType', viewType),
  startTable: (tableId: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:startTable', tableId),
  startRandomTable: (tables: Table[]): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:startRandomTable', tables),
};

contextBridge.exposeInMainWorld('api', frontendApi);

import { contextBridge, ipcRenderer, webUtils } from 'electron';

import type { Api, ApiResult } from 'src/types/api';
import type { Config } from 'src/types/config';
import type { FileSystemItem, TableFile } from 'src/types/file';
import type { ScanResult, Table } from 'src/types/table';

const invoke = <T>(channel: string, ...args: any[]): Promise<T> =>
  ipcRenderer.invoke(channel, ...args);

const frontendApi: Api = {
  getAllTables: (): Promise<ApiResult<Table[]>> =>
    invoke<ApiResult<Table[]>>('api:getAllTables'),
  setTableFavorite: (id: string, fav: boolean): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:setTableFavorite', id, fav),
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
  applyScanResult: (scanResult: ScanResult): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:applyScanResult', scanResult),
  exportTables: (destinationPath: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:exportTables', destinationPath),
  getConfig: (): Promise<ApiResult<Config>> =>
    invoke<ApiResult<Config>>('api:getConfig'),
  updateVpxRootPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateVpxRootPath', path),
  updateRomsDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateRomsDirectoryPath', path),
  updateTablesDirectoryPath: (path: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateTablesDirectoryPath', path),
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
  updateOrder: (order: Config['order']): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:updateOrder', order),
  startTable: (tableId: string): Promise<ApiResult<null>> =>
    invoke<ApiResult<null>>('api:startTable', tableId),
};

contextBridge.exposeInMainWorld('api', frontendApi);

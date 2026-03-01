import { contextBridge, ipcRenderer, webUtils } from 'electron';

import type { Api } from 'src/types/api';
import type { FileSystemItem } from 'src/types/file';
import type { Table } from 'src/types/table';

const invoke = <T>(channel: string, ...args: any[]): Promise<T> =>
  ipcRenderer.invoke(channel, ...args);

const frontendApi: Api = {
  getAllTables: (): Promise<Table[]> => invoke<Table[]>('api:getAllTables'),
  setTableFavorite: (id: string, fav: boolean): Promise<void> =>
    invoke('api:setTableFavorite', id, fav).then(() => undefined),
  deleteTable: (id: string): Promise<void> =>
    invoke('api:deleteTable', id).then(() => undefined),
  renameTable: (id: string, newName: string): Promise<void> =>
    invoke('api:renameTable', id, newName).then(() => undefined),
  getExpectedRomName: (vpxFilePath: string): Promise<string | null> =>
    invoke<string | null>('api:getExpectedRomName', vpxFilePath),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  getDirectoryTree: (
    directoryPath: string,
    acceptedExtensions: string[],
  ): Promise<Array<FileSystemItem>> =>
    invoke<Array<FileSystemItem>>(
      'api:getDirectoryTree',
      directoryPath,
      acceptedExtensions,
    ),
  importTables: (tables, deleteAfterImport): Promise<void> =>
    invoke('api:importTables', tables, deleteAfterImport).then(() => undefined),
  getConfig: () => invoke('api:getConfig'),
  updateVpxRootPath: (path: string): Promise<void> =>
    invoke('api:updateVpxRootPath', path).then(() => undefined),
  updateRomsDirectoryPath: (path: string): Promise<void> =>
    invoke('api:updateRomsDirectoryPath', path).then(() => undefined),
  updateTablesDirectoryPath: (path: string): Promise<void> =>
    invoke('api:updateTablesDirectoryPath', path).then(() => undefined),
  updateDeleteFilesAfterImport: (deleteAfterImport: boolean): Promise<void> =>
    invoke('api:updateDeleteFilesAfterImport', deleteAfterImport).then(
      () => undefined,
    ),
  startTable: (tableId: string): Promise<void> =>
    invoke('api:startTable', tableId).then(() => undefined),
};

contextBridge.exposeInMainWorld('api', frontendApi);

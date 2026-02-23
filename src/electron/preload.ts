import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { FileSystemItem } from 'src/types/file'
import type { Table } from 'src/types/table'

const invoke = <T>(channel: string, ...args: any[]): Promise<T> => ipcRenderer.invoke(channel, ...args)

contextBridge.exposeInMainWorld('api', {
  getAllTables: (): Promise<Table[]> => invoke<Table[]>('api:getAllTables'),
  getTableById: (id: string): Promise<Table | null> => invoke<Table | null>('api:getTableById', id),
  createTable: (item: Table): Promise<Table | null> => invoke<Table | null>('api:createTable', item),
  updateTable: (id: string, item: Partial<Table>): Promise<Table | null> => invoke<Table | null>('api:updateTable', id, item),
  deleteTable: (id: string): Promise<boolean> => invoke<boolean>('api:deleteTable', id),
  setTableFavorite: (id: string, fav: boolean): Promise<Table | null> => invoke<Table | null>('api:setTableFavorite', id, fav),
  ping: (): Promise<{ ok: true }> => invoke('api:ping'),
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
})

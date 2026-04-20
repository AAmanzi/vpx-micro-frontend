import { FileSystemItem, TableFile } from './file';

export interface AndroidFileSystemItem {
  path: string;
  name: string;
}

export interface AndroidScanResult {
  tablesToUpload: Array<TableFile>;
  unsyncedRomsToUpload: Array<FileSystemItem>;
  filesToDelete: Array<AndroidFileSystemItem>;
  tablesInSync: Array<TableFile>;
}

export interface AndroidSyncApplyPayload {
  tablesToUpload: Array<TableFile>;
  unsyncedRomsToUpload: Array<FileSystemItem>;
  filesToDelete: Array<AndroidFileSystemItem>;
}

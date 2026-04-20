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

export type AndroidSyncPhase = 'upload' | 'delete';

export interface AndroidSyncProgressEvent {
  operationId: string;
  phase: AndroidSyncPhase;
  fileName: string;
  processedBytes: number;
  totalBytes: number;
  processedFiles: number;
  totalFiles: number;
}

export interface AndroidSyncApplyItemResult {
  fileName: string;
  path: string;
  phase: AndroidSyncPhase;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface AndroidSyncApplyResult {
  operationId: string;
  completed: Array<AndroidSyncApplyItemResult>;
  failed: Array<AndroidSyncApplyItemResult>;
}

import { LaunchFlags } from './config';
import { FileSystemItem, TableFile } from './file';

export type TableImagePreference = 'manual' | 'none';

export type LibraryFileType = 'table' | 'rom' | 'directb2s';

export interface LibraryFile {
  id: string;
  type: LibraryFileType;
  path: string;
}

export interface LibraryStore {
  tables: Record<string, Table>;
  files: Record<string, LibraryFile>;
}

export interface Table {
  id: string;
  name: string;

  vpxFileId: string;
  romFileId?: string;
  backglassFileId?: string;

  isFavorite: boolean;
  isArchived?: boolean;
  isForAndroid?: boolean;
  lastPlayedTimestamp?: number;
  dateAddedTimestamp: number;

  vpxExecutablePath?: string;
  // Per-table overrides of the global launch flags; unset flags inherit the global value
  launchFlags?: Partial<LaunchFlags>;
  imgUrl?: string;
  imagePreference?: TableImagePreference;
}

export interface ResolvedTable extends Omit<
  Table,
  'vpxFileId' | 'romFileId' | 'backglassFileId'
> {
  vpxFile: string;
  romFile?: string;
  vpxFilePath: string;
  romFilePath?: string;
  backglassFile?: string;
  backglassFilePath?: string;
}

export interface ScanResult {
  newTables: Array<TableFile>;
  // On scan: new tables the user skipped before. On apply: new tables deselected now.
  skippedTablePaths: Array<string>;
  unmatchedRoms: Array<FileSystemItem>;
  tablesWithMissingFiles: Array<{
    table: ResolvedTable;
    missingVpxFile: boolean;
    missingRomFile: boolean;
  }>;
}

export enum GroupType {
  allTables = 'allTables',
  favorites = 'favorites',
  archived = 'archived',
  allTablesIncludingArchived = 'allTablesIncludingArchived',
}

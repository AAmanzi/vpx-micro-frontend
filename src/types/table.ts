import { FileSystemItem, TableFile } from './file';

export type TableImagePreference = 'manual' | 'none';

export interface Table {
  id: string;
  name: string;

  vpxFile: string;
  romFile?: string;
  vpxFilePath: string;
  romFilePath?: string;

  isFavorite: boolean;
  isArchived?: boolean;
  isForAndroid?: boolean;
  lastPlayedTimestamp?: number;
  dateAddedTimestamp: number;

  vpxExecutablePath?: string;
  imgUrl?: string;
  imagePreference?: TableImagePreference;
}

export interface ScanResult {
  newTables: Array<TableFile>;
  // On scan: new tables the user skipped before. On apply: new tables deselected now.
  skippedTablePaths: Array<string>;
  unmatchedRoms: Array<FileSystemItem>;
  tablesWithMissingFiles: Array<{
    table: Table;
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

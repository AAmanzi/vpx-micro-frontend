import { FileSystemItem, TableFile } from './file';

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
}

export interface ScanResult {
  newTables: Array<TableFile>;
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

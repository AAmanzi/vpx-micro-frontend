export interface LaunchFlags {
  // -LessCPUthreads
  lessCpuThreads: boolean;
  // -ExtMinimized: pause menu on VPX <= 10.8.0, a launch error on 10.8.1+
  extMinimized: boolean;
}

export interface Config {
  vpxRootPath: string;
  deleteFilesAfterImport: boolean;
  romsDirectory?: string;
  tablesDirectory?: string;
  vpxExecutablePath?: string;
  keepFavoritesOnTop: boolean;
  order: Order;
  viewType: ViewType;
  androidFeaturesEnabled?: boolean;
  androidWebServerUrl?: string;
  androidTablesDirectory?: string;
  androidRomsDirectory?: string;
  skippedScanTablePaths?: Array<string>;
  launchFlags?: LaunchFlags;
  updateNoticeDismissedAt?: number;
}

export enum Order {
  nameAsc = 'nameAsc',
  nameDesc = 'nameDesc',
  dateAddedAsc = 'dateAddedAsc',
  dateAddedDesc = 'dateAddedDesc',
  recentlyPlayed = 'recentlyPlayed',
  leastPlayed = 'leastPlayed',
}

export enum ViewType {
  grid = 'grid',
  list = 'list',
}

export type Platform = 'win32' | 'darwin' | 'linux';

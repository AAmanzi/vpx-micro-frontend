export interface Config {
  vpxRootPath: string;
  deleteFilesAfterImport: boolean;
  romsDirectory?: string;
  tablesDirectory?: string;
  keepFavoritesOnTop: boolean;
  order: Order;
}

export enum Order {
  nameAsc = 'nameAsc',
  nameDesc = 'nameDesc',
  dateAddedAsc = 'dateAddedAsc',
  dateAddedDesc = 'dateAddedDesc',
  recentlyPlayed = 'recentlyPlayed',
  leastPlayed = 'leastPlayed',
}

export interface Config {
  vpxRootPath: string;
  deleteFilesAfterImport: boolean;
  romsDirectory?: string;
  tablesDirectory?: string;
  keepFavoritesOnTop: boolean;
  order: Order;
  viewType: ViewType;
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

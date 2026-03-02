export interface Table {
  id: string;
  name: string;

  vpxFile: string;
  romFile?: string;
  vpxFilePath: string;
  romFilePath?: string;

  isFavorite: boolean;
  lastPlayedTimestamp?: number;
  dateAddedTimestamp: number;
}

export interface Table {
  id: string;
  name: string;
  vpxFile: string;
  romFile?: string;
  isFavorite: boolean;
  lastPlayed?: number;
  vpxFilePath: string;
  romFilePath?: string;
}

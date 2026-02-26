import type { Config } from 'src/types/config';

import * as configDb from '../database/config';

export function getConfig(): Config {
  return configDb.getConfig();
}

export function updateVpxRootPath(path: string): void {
  configDb.updateVpxRootPath(path);
}

export function updateRomsDirectoryPath(path: string): void {
  configDb.updateRomsDirectoryPath(path);
}

export function updateTablesDirectoryPath(path: string): void {
  configDb.updateTablesDirectoryPath(path);
}

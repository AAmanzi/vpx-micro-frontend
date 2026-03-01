import Store from 'electron-store';

import { VPX_DEFAULT_ROOT_PATH } from 'src/consts/vpx';
import type { Config } from 'src/types/config';
import { getDefaultRomsDirectory, getDefaultTablesDirectory } from 'src/utils';

type ConfigStoreSchema = {
  config: Config;
};

const store = new Store<ConfigStoreSchema>({
  name: 'app-config',
  defaults: {
    config: {
      vpxRootPath: VPX_DEFAULT_ROOT_PATH,
      deleteFilesAfterImport: false,
      romsDirectory: '',
      tablesDirectory: '',
    },
  },
});

const getStoredConfig = (): Config => store.get('config');

export function getConfig(): Config {
  return getStoredConfig();
}

export function getRomsDirectoryPath(): string {
  const config = getStoredConfig();

  if (config.romsDirectory) {
    return config.romsDirectory;
  }

  return getDefaultRomsDirectory(config.vpxRootPath);
}

export function getTablesDirectoryPath(): string {
  const config = getStoredConfig();

  if (config.tablesDirectory) {
    return config.tablesDirectory;
  }

  return getDefaultTablesDirectory(config.vpxRootPath);
}

export function updateVpxRootPath(path: string): void {
  store.set('config', {
    ...getStoredConfig(),
    vpxRootPath: path,
  });
}

export function updateRomsDirectoryPath(path: string): void {
  store.set('config', {
    ...getStoredConfig(),
    romsDirectory: path,
  });
}

export function updateTablesDirectoryPath(path: string): void {
  store.set('config', {
    ...getStoredConfig(),
    tablesDirectory: path,
  });
}

export function updateDeleteFilesAfterImport(deleteAfterImport: boolean): void {
  store.set('config', {
    ...getStoredConfig(),
    deleteFilesAfterImport: deleteAfterImport,
  });
}

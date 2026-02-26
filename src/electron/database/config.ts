import Store from 'electron-store';

import type { Config } from 'src/types/config';

type ConfigStoreSchema = {
  config: Config;
};

const store = new Store<ConfigStoreSchema>({
  name: 'app-config',
  defaults: {
    config: {
      vpxRootPath: 'C:/Games/VisualPinball',
      romsDirectory: '',
      tablesDirectory: '',
    },
  },
});

const getStoredConfig = (): Config => store.get('config');

export function getConfig(): Config {
  return getStoredConfig();
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
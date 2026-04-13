import Store from 'electron-store';

import { VPX_DEFAULT_ROOT_PATH } from 'src/consts/vpx';
import { Config, Order, ViewType } from 'src/types/config';
import { getDefaultRomsDirectory, getDefaultTablesDirectory } from 'src/utils';

import { resolveUserPath } from '../utils/path';

type ConfigStoreSchema = {
  config: Config;
};

const defaultConfig: Config = {
  vpxRootPath: VPX_DEFAULT_ROOT_PATH,
  deleteFilesAfterImport: false,
  romsDirectory: '',
  tablesDirectory: '',
  keepFavoritesOnTop: false,
  order: Order.dateAddedDesc,
  viewType: ViewType.grid,
};

const store = new Store<ConfigStoreSchema>({
  name: 'app-config',
  defaults: {
    config: defaultConfig,
  },
});

const getStoredConfig = (): Config => ({
  ...defaultConfig,
  ...store.get('config'),
});

export function getConfig(): Config {
  return getStoredConfig();
}

export function getRomsDirectoryPath(): string {
  const config = getStoredConfig();

  if (config.romsDirectory) {
    return resolveUserPath(config.romsDirectory);
  }

  return resolveUserPath(getDefaultRomsDirectory(config.vpxRootPath));
}

export function getTablesDirectoryPath(): string {
  const config = getStoredConfig();

  if (config.tablesDirectory) {
    return resolveUserPath(config.tablesDirectory);
  }

  return resolveUserPath(getDefaultTablesDirectory(config.vpxRootPath));
}

export function getVpxRootPath(): string {
  const config = getStoredConfig();

  return resolveUserPath(config.vpxRootPath);
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

export function updateKeepFavoritesOnTop(keepFavoritesOnTop: boolean): void {
  store.set('config', {
    ...getStoredConfig(),
    keepFavoritesOnTop,
  });
}

export function updateOrder(order: Config['order']): void {
  store.set('config', {
    ...getStoredConfig(),
    order,
  });
}

export function updateViewType(viewType: Config['viewType']): void {
  store.set('config', {
    ...getStoredConfig(),
    viewType,
  });
}

import Store from 'electron-store';

import {
  VPX_DEFAULT_ANDROID_ROMS_PATH,
  VPX_DEFAULT_ANDROID_TABLES_PATH,
  VPX_DEFAULT_LAUNCH_FLAGS,
  VPX_DEFAULT_ROOT_PATH,
} from 'src/consts/vpx';
import {
  Config,
  DEFAULT_GRID_SETTINGS,
  GridSettings,
  LaunchFlags,
  Order,
  ViewType,
} from 'src/types/config';
import {
  getDefaultRomsDirectory,
  getDefaultTablesDirectory,
  getDefaultVpxExecutablePath,
} from 'src/utils';

import { resolveUserPath } from '../utils/path';

type ConfigStoreSchema = {
  config: Config;
};

const defaultConfig: Config = {
  vpxRootPath: VPX_DEFAULT_ROOT_PATH,
  deleteFilesAfterImport: false,
  romsDirectory: '',
  tablesDirectory: '',
  vpxExecutablePath: '',
  keepFavoritesOnTop: false,
  order: Order.dateAddedDesc,
  viewType: ViewType.grid,
  gridSettings: DEFAULT_GRID_SETTINGS,
  androidFeaturesEnabled: false,
  androidWebServerUrl: '',
  androidTablesDirectory: VPX_DEFAULT_ANDROID_TABLES_PATH,
  androidRomsDirectory: VPX_DEFAULT_ANDROID_ROMS_PATH,
  launchFlags: VPX_DEFAULT_LAUNCH_FLAGS,
};

const store = new Store<ConfigStoreSchema>({
  name: 'app-config',
  defaults: {
    config: defaultConfig,
  },
});

const getStoredConfig = (): Config => {
  const stored = store.get('config');

  return {
    ...defaultConfig,
    ...stored,
    gridSettings: {
      ...DEFAULT_GRID_SETTINGS,
      ...stored?.gridSettings,
    },
    launchFlags: {
      ...VPX_DEFAULT_LAUNCH_FLAGS,
      ...stored?.launchFlags,
    },
  };
};

export function getConfig(): Config {
  return getStoredConfig();
}

export function dismissUpdateNotice(timestamp: number): void {
  store.set('config', {
    ...getStoredConfig(),
    updateNoticeDismissedAt: timestamp,
  });
}

export function getLaunchFlags(): LaunchFlags {
  return getStoredConfig().launchFlags as LaunchFlags;
}

export function updateLaunchFlags(launchFlags: LaunchFlags): void {
  store.set('config', {
    ...getStoredConfig(),
    launchFlags,
  });
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

export function getVpxExecutablePath(): string {
  const config = getStoredConfig();

  if (config.vpxExecutablePath) {
    return resolveUserPath(config.vpxExecutablePath);
  }

  return resolveUserPath(getDefaultVpxExecutablePath(config.vpxRootPath));
}

export function updateVpxRootPath(path: string): void {
  store.set('config', {
    ...getStoredConfig(),
    vpxRootPath: path,
  });
}

export function updateVpxExecutablePath(path: string): void {
  store.set('config', {
    ...getStoredConfig(),
    vpxExecutablePath: path,
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

export function updateGridSettings(settings: Partial<GridSettings>): void {
  const config = getStoredConfig();

  store.set('config', {
    ...config,
    gridSettings: {
      ...config.gridSettings,
      ...settings,
    },
  });
}

export function getSkippedScanTablePaths(): Array<string> {
  return getStoredConfig().skippedScanTablePaths ?? [];
}

export function updateSkippedScanTablePaths(
  skippedScanTablePaths: Array<string>,
): void {
  store.set('config', {
    ...getStoredConfig(),
    skippedScanTablePaths,
  });
}

export function updateAndroidFeaturesEnabled(
  androidFeaturesEnabled: boolean,
): void {
  store.set('config', {
    ...getStoredConfig(),
    androidFeaturesEnabled,
  });
}

export function updateAndroidWebServerUrl(androidWebServerUrl: string): void {
  store.set('config', {
    ...getStoredConfig(),
    androidWebServerUrl,
  });
}

export function updateAndroidTablesDirectoryPath(
  androidTablesDirectory: string,
): void {
  store.set('config', {
    ...getStoredConfig(),
    androidTablesDirectory,
  });
}

export function updateAndroidRomsDirectoryPath(
  androidRomsDirectory: string,
): void {
  store.set('config', {
    ...getStoredConfig(),
    androidRomsDirectory,
  });
}

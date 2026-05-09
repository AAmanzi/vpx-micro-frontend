import { apiFailure, apiSuccess } from '.';
import fs from 'fs';
import path from 'path';

import { VPX_DEFAULT_ROM_PATH, VPX_DEFAULT_TABLES_PATH } from 'src/consts/vpx';
import type { ApiResult } from 'src/types/api';
import type { Config, Platform } from 'src/types/config';
import { normalizePath } from 'src/utils';

import * as configDb from '../database/config';
import { resolveUserPath } from '../utils/path';

export function getPlatform(): ApiResult<Platform> {
  try {
    return apiSuccess(process.platform as Platform);
  } catch (error) {
    return apiFailure(error);
  }
}

export function getConfig(): ApiResult<Config> {
  try {
    return apiSuccess(configDb.getConfig());
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateVpxRootPath(path: string): ApiResult<null> {
  try {
    configDb.updateVpxRootPath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateVpxExecutablePath(path: string): ApiResult<null> {
  try {
    configDb.updateVpxExecutablePath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateRomsDirectoryPath(path: string): ApiResult<null> {
  try {
    configDb.updateRomsDirectoryPath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateTablesDirectoryPath(path: string): ApiResult<null> {
  try {
    configDb.updateTablesDirectoryPath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function setupDefaultLibraryFolders(
  libraryFolder: string,
): ApiResult<null> {
  try {
    const resolvedLibraryFolder = resolveUserPath(libraryFolder);

    if (!resolvedLibraryFolder) {
      throw new Error('Library folder is required');
    }

    const tablesDirectory = normalizePath(
      path.join(resolvedLibraryFolder, VPX_DEFAULT_TABLES_PATH),
    );
    const romsDirectory = normalizePath(
      path.join(resolvedLibraryFolder, VPX_DEFAULT_ROM_PATH),
    );

    fs.mkdirSync(resolveUserPath(tablesDirectory), { recursive: true });
    fs.mkdirSync(resolveUserPath(romsDirectory), { recursive: true });

    configDb.updateTablesDirectoryPath(tablesDirectory);
    configDb.updateRomsDirectoryPath(romsDirectory);

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateDeleteFilesAfterImport(
  deleteAfterImport: boolean,
): ApiResult<null> {
  try {
    configDb.updateDeleteFilesAfterImport(deleteAfterImport);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateKeepFavoritesOnTop(
  keepFavoritesOnTop: boolean,
): ApiResult<null> {
  try {
    configDb.updateKeepFavoritesOnTop(keepFavoritesOnTop);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateOrder(order: Config['order']): ApiResult<null> {
  try {
    configDb.updateOrder(order);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateViewType(viewType: Config['viewType']): ApiResult<null> {
  try {
    configDb.updateViewType(viewType);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateAndroidFeaturesEnabled(
  androidFeaturesEnabled: boolean,
): ApiResult<null> {
  try {
    configDb.updateAndroidFeaturesEnabled(androidFeaturesEnabled);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateAndroidWebServerUrl(path: string): ApiResult<null> {
  try {
    configDb.updateAndroidWebServerUrl(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateAndroidTablesDirectoryPath(
  path: string,
): ApiResult<null> {
  try {
    configDb.updateAndroidTablesDirectoryPath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateAndroidRomsDirectoryPath(path: string): ApiResult<null> {
  try {
    configDb.updateAndroidRomsDirectoryPath(path);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

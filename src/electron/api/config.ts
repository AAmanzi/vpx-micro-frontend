import { apiFailure, apiSuccess } from '.';

import type { ApiResult } from 'src/types/api';
import type { Config } from 'src/types/config';

import * as configDb from '../database/config';

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

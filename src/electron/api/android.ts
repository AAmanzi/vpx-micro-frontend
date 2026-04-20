import { apiFailure, apiSuccess } from '.';

import type { ApiResult } from 'src/types/api';
import type { AndroidScanResult, AndroidSyncApplyPayload } from 'src/types/android';

import * as configDb from '../database/config';
import { pingAndroidServer } from '../services/android';

const emptyAndroidScanResult = (): AndroidScanResult => ({
  tablesToUpload: [],
  unsyncedRomsToUpload: [],
  filesToDelete: [],
  tablesInSync: [],
});

export async function scanAndroidLibrary(): Promise<ApiResult<AndroidScanResult>> {
  try {
    const androidWebServerUrl = configDb.getConfig().androidWebServerUrl || '';

    await pingAndroidServer(androidWebServerUrl);

    return apiSuccess(emptyAndroidScanResult());
  } catch (error) {
    return apiFailure(error);
  }
}

export function applyAndroidSync(
  _payload: AndroidSyncApplyPayload,
): ApiResult<null> {
  return apiFailure({
    code: 'ANDROID_NOT_IMPLEMENTED',
    message: 'Android sync apply is not implemented yet.',
  });
}

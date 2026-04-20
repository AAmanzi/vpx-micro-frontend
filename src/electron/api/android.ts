import { apiFailure, apiSuccess } from '.';

import {
  VPX_DEFAULT_ANDROID_ROMS_PATH,
  VPX_DEFAULT_ANDROID_TABLES_PATH,
} from 'src/consts/vpx';
import type {
  AndroidFileSystemItem,
  AndroidScanResult,
  AndroidSyncApplyPayload,
} from 'src/types/android';
import type { ApiResult } from 'src/types/api';
import type { FileSystemItem, TableFile } from 'src/types/file';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import { getAndroidFiles } from '../services/android';

const normalizeName = (value: string): string => value.trim().toLowerCase();
const isVpxFile = (name: string): boolean =>
  normalizeName(name).endsWith('.vpx');
const isZipFile = (name: string): boolean =>
  normalizeName(name).endsWith('.zip');

const buildRemoteFilePath = (directory: string, fileName: string): string => {
  const normalizedDirectory = directory.trim().replace(/\/+$/, '');

  if (!normalizedDirectory) {
    return fileName;
  }

  return `${normalizedDirectory}/${fileName}`;
};

const toTableFile = (
  table: ReturnType<typeof tablesDb.getAll>[number],
): TableFile => ({
  name: table.name,
  filePath: table.vpxFilePath,
  fileName: table.vpxFile,
  rom:
    table.romFile && table.romFilePath
      ? {
          path: table.romFilePath,
          name: table.romFile,
        }
      : undefined,
});

export async function scanAndroidLibrary(): Promise<
  ApiResult<AndroidScanResult>
> {
  try {
    const tables = tablesDb
      .getAll()
      .filter(
        (table) => table.isForAndroid && !!table.vpxFile && !!table.vpxFilePath,
      );
    const config = configDb.getConfig();

    const serverUrl = config.androidWebServerUrl || '';
    const tablesDirectory =
      config.androidTablesDirectory || VPX_DEFAULT_ANDROID_TABLES_PATH;
    const romsDirectory =
      config.androidRomsDirectory || VPX_DEFAULT_ANDROID_ROMS_PATH;

    const [androidTableFiles, androidRomFiles] = await Promise.all([
      getAndroidFiles(serverUrl, tablesDirectory),
      getAndroidFiles(serverUrl, romsDirectory),
    ]);

    const androidTableFileNames = new Set(
      androidTableFiles
        .filter((file) => !file.isDir && isVpxFile(file.name))
        .map((file) => normalizeName(file.name)),
    );

    const androidRomFileNames = new Set(
      androidRomFiles
        .filter((file) => !file.isDir && isZipFile(file.name))
        .map((file) => normalizeName(file.name)),
    );

    const tableFileModels = tables.map(toTableFile);

    const localTableFileNames = new Set(
      tableFileModels.map((table) => normalizeName(table.fileName)),
    );
    const localRomFiles: FileSystemItem[] = tableFileModels
      .map((table) => table.rom)
      .filter(Boolean) as FileSystemItem[];

    const localRomFileNames = new Set(
      localRomFiles.map((romFile) => normalizeName(romFile.name)),
    );

    const tablesToUpload = tableFileModels.filter(
      (table) => !androidTableFileNames.has(normalizeName(table.fileName)),
    );
    const tablesInSync = tableFileModels.filter((table) =>
      androidTableFileNames.has(normalizeName(table.fileName)),
    );

    const romNamesFromTablesInSync = new Set(
      tablesInSync
        .map((table) => table.rom)
        .filter(Boolean)
        .map((rom) => normalizeName((rom as FileSystemItem).name)),
    );

    const unsyncedRomsToUpload = localRomFiles
      .filter((romFile) =>
        romNamesFromTablesInSync.has(normalizeName(romFile.name)),
      )
      .filter(
        (romFile) => !androidRomFileNames.has(normalizeName(romFile.name)),
      );

    const filesToDelete: AndroidFileSystemItem[] = [
      ...androidTableFiles
        .filter(
          (file) =>
            !file.isDir &&
            isVpxFile(file.name) &&
            !localTableFileNames.has(normalizeName(file.name)),
        )
        .map((file) => ({
          name: file.name,
          path: buildRemoteFilePath(tablesDirectory, file.name),
        })),
      ...androidRomFiles
        .filter(
          (file) =>
            !file.isDir &&
            isZipFile(file.name) &&
            !localRomFileNames.has(normalizeName(file.name)),
        )
        .map((file) => ({
          name: file.name,
          path: buildRemoteFilePath(romsDirectory, file.name),
        })),
    ];

    return apiSuccess({
      tablesToUpload,
      unsyncedRomsToUpload,
      filesToDelete,
      tablesInSync,
    });
  } catch (error) {
    return apiFailure(error);
  }
}

export function applyAndroidSync({
  filesToDelete,
  tablesToUpload,
  unsyncedRomsToUpload,
}: AndroidSyncApplyPayload): ApiResult<null> {
  return apiFailure({
    code: 'ANDROID_NOT_IMPLEMENTED',
    message: 'Android sync apply is not implemented yet.',
  });
}

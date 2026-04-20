import { apiFailure, apiSuccess } from '.';
import fs from 'fs';

import {
  VPX_DEFAULT_ANDROID_ROMS_PATH,
  VPX_DEFAULT_ANDROID_TABLES_PATH,
} from 'src/consts/vpx';
import type {
  AndroidFileSystemItem,
  AndroidScanResult,
  AndroidSyncApplyPayload,
  AndroidSyncProgressEvent,
} from 'src/types/android';
import type { ApiResult } from 'src/types/api';
import type { FileSystemItem, TableFile } from 'src/types/file';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import {
  deleteAndroidFile,
  getAndroidFiles,
  uploadAndroidFile,
} from '../services/android';

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

    const androidTableFileSizes = new Map(
      androidTableFiles
        .filter((file) => !file.isDir && isVpxFile(file.name))
        .map((file) => [normalizeName(file.name), file.size]),
    );

    const androidRomFileSizes = new Map(
      androidRomFiles
        .filter((file) => !file.isDir && isZipFile(file.name))
        .map((file) => [normalizeName(file.name), file.size]),
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

    const tablesToUpload = tableFileModels.filter((table) => {
      const remoteSize = androidTableFileSizes.get(
        normalizeName(table.fileName),
      );
      if (remoteSize === undefined) return true;
      const localSize = fs.statSync(table.filePath).size;
      return remoteSize !== localSize;
    });
    const tablesInSync = tableFileModels.filter((table) => {
      const remoteSize = androidTableFileSizes.get(
        normalizeName(table.fileName),
      );
      if (remoteSize === undefined) return false;
      const localSize = fs.statSync(table.filePath).size;
      return remoteSize === localSize;
    });

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
      .filter((romFile) => {
        const remoteSize = androidRomFileSizes.get(normalizeName(romFile.name));
        if (remoteSize === undefined) return true;
        const localSize = fs.statSync(romFile.path).size;
        return remoteSize !== localSize;
      });

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

export async function applyAndroidSync(
  {
    filesToDelete,
    tablesToUpload,
    unsyncedRomsToUpload,
  }: AndroidSyncApplyPayload,
  onProgress?: (event: AndroidSyncProgressEvent) => void,
): Promise<ApiResult<null>> {
  try {
    const config = configDb.getConfig();

    const serverUrl = config.androidWebServerUrl || '';
    const tablesDirectory =
      config.androidTablesDirectory || VPX_DEFAULT_ANDROID_TABLES_PATH;
    const romsDirectory =
      config.androidRomsDirectory || VPX_DEFAULT_ANDROID_ROMS_PATH;

    const romUploadsFromTables = tablesToUpload.filter((t) => !!t.rom);
    const totalSteps =
      tablesToUpload.length +
      romUploadsFromTables.length +
      unsyncedRomsToUpload.length +
      filesToDelete.length;
    let step = 0;

    const emitProgress = (label: string) => {
      step += 1;
      onProgress?.({ step, totalSteps, label });
    };

    const uploadedRomNames = new Set<string>();

    for (const table of tablesToUpload) {
      emitProgress(`Uploading ${table.fileName}`);
      const fileData = await fs.promises.readFile(table.filePath);
      const remotePath = buildRemoteFilePath(tablesDirectory, table.fileName);

      await uploadAndroidFile(serverUrl, remotePath, fileData);

      if (table.rom) {
        const normalizedRomName = normalizeName(table.rom.name);

        if (!uploadedRomNames.has(normalizedRomName)) {
          emitProgress(`Uploading ROM ${table.rom.name}`);
          const romFileData = await fs.promises.readFile(table.rom.path);
          const remoteRomPath = buildRemoteFilePath(
            romsDirectory,
            table.rom.name,
          );

          await uploadAndroidFile(serverUrl, remoteRomPath, romFileData);
          uploadedRomNames.add(normalizedRomName);
        } else {
          // Still count the step even if we skip the duplicate
          step += 1;
        }
      }
    }

    for (const rom of unsyncedRomsToUpload) {
      const normalizedRomName = normalizeName(rom.name);

      if (uploadedRomNames.has(normalizedRomName)) {
        step += 1;
        continue;
      }

      emitProgress(`Uploading ROM ${rom.name}`);
      const fileData = await fs.promises.readFile(rom.path);
      const remotePath = buildRemoteFilePath(romsDirectory, rom.name);

      await uploadAndroidFile(serverUrl, remotePath, fileData);
      uploadedRomNames.add(normalizedRomName);
    }

    for (const file of filesToDelete) {
      emitProgress(`Deleting ${file.name}`);
      await deleteAndroidFile(serverUrl, file.path);
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

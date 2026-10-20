import { apiFailure, apiSuccess } from '.';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { TABLE_STARTUP_LOCK_MS } from 'src/consts/platform';
import type { ApiResult } from 'src/types/api';
import type { LaunchFlags } from 'src/types/config';
import type { FileSystemItem, TableFile } from 'src/types/file';
import { GroupType, ResolvedTable, ScanResult, Table } from 'src/types/table';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import {
  cleanTablesWithMissingFiles,
  deleteUnusedRoms,
  registerTableFiles,
} from '../utils/applyScanResult';
import {
  copyFile,
  createDirectoryIfNotExists,
  deleteFile,
  moveFile,
  removeEmptyParentDirectories,
} from '../utils/fileManagement';
import {
  getLibraryFilePathKey,
  normalizePathForComparison,
  resolveUserPath,
} from '../utils/path';
import {
  findTablesWithMissingFiles,
  scanFilesByExtension,
  scanNewRoms,
  scanNewTables,
} from '../utils/scanVpxLibrary';
import { startVpxTable } from '../utils/startVpxTable';
import {
  lookupTableImageCandidates,
  lookupTableImageUrl,
} from '../utils/tableImages';

const isZipFile = (name: string): boolean =>
  path.extname(name).toLowerCase() === '.zip';

const resolveLaunchFlags = (
  table: Pick<Table, 'launchFlags'>,
): LaunchFlags => ({
  ...configDb.getLaunchFlags(),
  ...table.launchFlags,
});

const tableStartLockById = new Map<string, number>();

const canStartTableNow = (tableId: string): boolean => {
  const lockUntil = tableStartLockById.get(tableId);

  if (!lockUntil) {
    return true;
  }

  if (lockUntil <= Date.now()) {
    tableStartLockById.delete(tableId);

    return true;
  }

  return false;
};

const lockTableStart = (tableId: string): void => {
  tableStartLockById.set(tableId, Date.now() + TABLE_STARTUP_LOCK_MS);
};

export function getAllTables(): ApiResult<ResolvedTable[]> {
  try {
    return apiSuccess(tablesDb.getAllResolved());
  } catch (error) {
    return apiFailure(error);
  }
}

export function setTableFavorite(id: string, fav: boolean): ApiResult<null> {
  try {
    const table = tablesDb.setFavorite(id, fav);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function setTableForAndroid(
  id: string,
  isForAndroid: boolean,
): ApiResult<null> {
  try {
    const table = tablesDb.setForAndroid(id, isForAndroid);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function setTableArchived(
  id: string,
  archived: boolean,
): ApiResult<null> {
  try {
    const table = tablesDb.setArchived(id, archived);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function deleteTable(id: string): ApiResult<null> {
  try {
    const storedTable = tablesDb.get(id);
    const table = tablesDb.getResolved(id);

    if (!storedTable || !table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    const backglassPath = tablesDb.getFile(
      storedTable.backglassFileId,
      'directb2s',
    )?.path;
    tablesDb.remove(id);

    const remainingTables = tablesDb.getAll();
    if (
      !remainingTables.some((item) => item.vpxFileId === storedTable.vpxFileId)
    ) {
      deleteFile(table.vpxFilePath);
    }

    const isRomStillAssigned = storedTable.romFileId
      ? remainingTables.some((item) => item.romFileId === storedTable.romFileId)
      : false;

    if (table.romFilePath && !isRomStillAssigned) {
      deleteFile(table.romFilePath);
    }

    if (backglassPath) {
      deleteFile(backglassPath);
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function renameTable(id: string, newName: string): ApiResult<null> {
  try {
    const updatedTable = tablesDb.update(id, { name: newName });

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateTableRom(
  tableId: string,
  rom: FileSystemItem | null,
): ApiResult<null> {
  try {
    const table = tablesDb.get(tableId);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    if (rom && !isZipFile(rom.name)) {
      return {
        success: false,
        error: {
          code: 'INVALID_ROM_FILE',
          message: 'ROM file must be a .zip file',
        },
      };
    }

    const currentRomPath = tablesDb.getFile(table.romFileId, 'rom')?.path;

    let nextRomPath: string | undefined;

    if (rom) {
      const romsDirectoryPath = configDb.getRomsDirectoryPath();
      const destinationRomPath = path.join(romsDirectoryPath, rom.name);

      nextRomPath = destinationRomPath;
    }

    const currentRomKey = currentRomPath
      ? getLibraryFilePathKey(currentRomPath)
      : undefined;
    const nextRomKey = nextRomPath
      ? getLibraryFilePathKey(nextRomPath)
      : undefined;
    const hasRomChanged = currentRomKey !== nextRomKey;

    if (hasRomChanged && nextRomPath) {
      if (rom) {
        const normalizedSourceRomPath = getLibraryFilePathKey(rom.path);

        if (normalizedSourceRomPath !== getLibraryFilePathKey(nextRomPath)) {
          copyFile(rom.path, nextRomPath);
        }
      }
    }

    const updatedTable = tablesDb.updateFileReference(
      tableId,
      'romFileId',
      'rom',
      nextRomPath,
    );

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    if (hasRomChanged && currentRomPath) {
      const isCurrentRomStillAssigned = tablesDb
        .getAll()
        .some(
          (item) => item.id !== tableId && item.romFileId === table.romFileId,
        );

      if (!isCurrentRomStillAssigned) {
        deleteFile(currentRomPath);
      }
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateTableVpxExecutablePath(
  tableId: string,
  executablePath: string | null,
): ApiResult<null> {
  try {
    const table = tablesDb.getResolved(tableId);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    const normalizedPath = executablePath?.trim();
    const updatedTable = tablesDb.update(tableId, {
      vpxExecutablePath: normalizedPath || undefined,
    });

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateTableLaunchFlags(
  tableId: string,
  launchFlags: Partial<LaunchFlags> | null,
): ApiResult<null> {
  try {
    // Absent keys are cleared via an explicit undefined, which JSON storage drops
    const overrides: Partial<LaunchFlags> = {};

    if (typeof launchFlags?.lessCpuThreads === 'boolean') {
      overrides.lessCpuThreads = launchFlags.lessCpuThreads;
    }

    if (typeof launchFlags?.extMinimized === 'boolean') {
      overrides.extMinimized = launchFlags.extMinimized;
    }

    const updatedTable = tablesDb.update(tableId, {
      launchFlags: Object.keys(overrides).length > 0 ? overrides : undefined,
    });

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function getTableImageCandidates(
  tableId: string,
): Promise<ApiResult<Array<string>>> {
  try {
    const table = tablesDb.getResolved(tableId);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    const imgUrls = await lookupTableImageCandidates({
      tableName: table.name,
      vpxFileName: table.vpxFile,
      romFileName: table.romFile,
    });

    return apiSuccess(imgUrls);
  } catch (error) {
    return apiFailure(error);
  }
}

export function updateTableImage(
  tableId: string,
  imgUrl: string,
): ApiResult<null> {
  try {
    const normalizedImgUrl = imgUrl.trim();

    if (!normalizedImgUrl) {
      return {
        success: false,
        error: {
          code: 'INVALID_IMAGE_URL',
          message: 'Image URL is required',
        },
      };
    }

    const updatedTable = tablesDb.update(tableId, {
      imgUrl: normalizedImgUrl,
      imagePreference: 'manual',
    });

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function clearTableImage(tableId: string): ApiResult<null> {
  try {
    const updatedTable = tablesDb.update(tableId, {
      imgUrl: undefined,
      imagePreference: 'none',
    });

    if (!updatedTable) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function importTables(
  tableFiles: Array<TableFile>,
  deleteAfterImport: boolean,
): Promise<ApiResult<null>> {
  try {
    const transferFile = deleteAfterImport ? moveFile : copyFile;
    const movedSourceFilePaths = new Set<string>();
    let missingSourceFailures = 0;
    let permissionFailures = 0;
    const tablesDirectoryPath = configDb.getTablesDirectoryPath();
    const romsDirectoryPath = configDb.getRomsDirectoryPath();

    const existingVpxPaths = new Set(
      tablesDb
        .getAllResolved()
        .map((table) => normalizePathForComparison(table.vpxFilePath)),
    );

    for (const tableFile of tableFiles) {
      try {
        const vpxSourceFilePath = tableFile.filePath;
        const romSourceFilePath = tableFile.rom?.path;

        const vpxDestinationFilePath = path.join(
          tablesDirectoryPath,
          tableFile.fileName,
        );
        let romDestinationFilePath = tableFile.rom
          ? path.join(romsDirectoryPath, tableFile.rom.name)
          : undefined;

        // a rom already in the library is referenced as is, never transferred
        const libraryRomPath = romSourceFilePath
          ? tablesDb
              .getFilesByType('rom')
              .find(
                (file) =>
                  normalizePathForComparison(file.path) ===
                  normalizePathForComparison(romSourceFilePath),
              )?.path
          : undefined;

        if (libraryRomPath) {
          romDestinationFilePath = libraryRomPath;
        }

        const normalizedDestinationPath = normalizePathForComparison(
          vpxDestinationFilePath,
        );

        if (existingVpxPaths.has(normalizedDestinationPath)) {
          continue;
        }

        if (vpxSourceFilePath !== vpxDestinationFilePath) {
          transferFile(vpxSourceFilePath, vpxDestinationFilePath);

          if (deleteAfterImport) {
            movedSourceFilePaths.add(vpxSourceFilePath);
          }
        }

        if (romSourceFilePath && romDestinationFilePath && !libraryRomPath) {
          const romWasAlreadyMoved =
            deleteAfterImport && movedSourceFilePaths.has(romSourceFilePath);

          if (
            normalizePathForComparison(romSourceFilePath) !==
              normalizePathForComparison(romDestinationFilePath) &&
            !romWasAlreadyMoved
          ) {
            transferFile(romSourceFilePath, romDestinationFilePath);

            if (deleteAfterImport) {
              movedSourceFilePaths.add(romSourceFilePath);
            }
          }
        }

        const imgUrl = await lookupTableImageUrl({
          tableName: tableFile.name,
          vpxFileName: tableFile.fileName,
          romFileName: tableFile.rom?.name,
        });

        const nextTable: Omit<
          Table,
          'vpxFileId' | 'romFileId' | 'backglassFileId'
        > = {
          id: uuidv4(),
          name: tableFile.name,
          isFavorite: false,
          isForAndroid: false,
          isArchived: false,
          dateAddedTimestamp: Date.now(),
          imgUrl,
        };

        tablesDb.createWithFiles(
          nextTable,
          vpxDestinationFilePath,
          romDestinationFilePath,
        );
        existingVpxPaths.add(normalizedDestinationPath);
      } catch (error) {
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string' &&
          error.message.includes('does not exist')
        ) {
          missingSourceFailures += 1;
          continue;
        }

        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          (error.code === 'EACCES' || error.code === 'EPERM')
        ) {
          permissionFailures += 1;
          continue;
        }

        throw error;
      }
    }

    if (deleteAfterImport) {
      Array.from(movedSourceFilePaths).forEach((sourceFilePath) => {
        removeEmptyParentDirectories(sourceFilePath);
      });
    }

    if (missingSourceFailures > 0) {
      return {
        success: true,
        data: null,
        warning: {
          code: 'IMPORT_MISSING_SOURCE_FILES',
          message: `${missingSourceFailures} table(s) failed to import because source files were missing`,
        },
      };
    }

    if (permissionFailures > 0) {
      return {
        success: false,
        error: {
          code: 'IMPORT_PERMISSION_DENIED',
          message: `Permission denied. The destination folder (e.g. Program Files) requires administrator access. Move your VPX library to C:\\Visual Pinball and update the library path in Settings, then try again.`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function startTable(tableId: string): Promise<ApiResult<null>> {
  try {
    const configVpxExecutablePath = configDb.getVpxExecutablePath();
    const table = tablesDb.getResolved(tableId);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tableId}`,
        },
      };
    }

    if (!canStartTableNow(tableId)) {
      return {
        success: false,
        error: {
          code: 'TABLE_START_IN_PROGRESS',
          message: 'Table is still starting. Please wait a moment.',
        },
      };
    }

    lockTableStart(tableId);

    try {
      await startVpxTable(
        table.vpxFilePath,
        table.vpxExecutablePath || configVpxExecutablePath,
        resolveLaunchFlags(table),
      );
    } catch (error) {
      tableStartLockById.delete(tableId);
      throw error;
    }

    tablesDb.update(tableId, {
      lastPlayedTimestamp: Date.now(),
    });

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function clearTables(): ApiResult<null> {
  try {
    tablesDb.clear();
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

function deleteUnmatchedBackglass(filePath: string): ApiResult<null> {
  try {
    const tablesDirectoryPath = configDb.getTablesDirectoryPath();
    if (!tablesDirectoryPath) {
      throw new Error('Tables directory is not configured');
    }

    const directoryPath = path.resolve(resolveUserPath(tablesDirectoryPath));
    const resolvedFilePath = path.resolve(resolveUserPath(filePath));
    const relativePath = path.relative(directoryPath, resolvedFilePath);

    if (
      !relativePath ||
      relativePath === '..' ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath) ||
      path.extname(resolvedFilePath).toLowerCase() !== '.directb2s'
    ) {
      throw new Error(
        'Only DirectB2S files in the Tables directory can be deleted',
      );
    }

    const normalizedFilePath = normalizePathForComparison(resolvedFilePath);
    const tables = tablesDb.getAll();
    const isAssociated = tables.some((table) => {
      const backglass = tablesDb.getFile(table.backglassFileId, 'directb2s');
      return normalizePathForComparison(backglass?.path) === normalizedFilePath;
    });
    const fileStem = normalizePathForComparison(
      path.basename(resolvedFilePath, path.extname(resolvedFilePath)),
    );
    const vpxFiles = scanFilesByExtension(tablesDirectoryPath, '.vpx');
    const hasMatchingTable = [
      ...vpxFiles.map((file) => file.path),
      ...tables
        .map((table) => tablesDb.getFile(table.vpxFileId, 'table')?.path)
        .filter((tablePath): tablePath is string => Boolean(tablePath)),
    ].some(
      (tablePath) =>
        normalizePathForComparison(
          path.basename(tablePath, path.extname(tablePath)),
        ) === fileStem,
    );

    if (isAssociated || hasMatchingTable) {
      throw new Error(
        'This backglass is associated with a table and cannot be deleted as unmatched',
      );
    }

    deleteFile(resolvedFilePath);
    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function scanVpxLibrary(): ApiResult<ScanResult> {
  // info:
  // - all roms are matched by file name
  // - all table files are matched by vpx file name

  // get all tables
  // get config paths
  const tables = tablesDb.getAllResolved();
  const tablesDirectoryPath = configDb.getTablesDirectoryPath();
  const romsDirectoryPath = configDb.getRomsDirectoryPath();

  // create set of existing table vpx files
  // create set of existing rom files
  const existingVpxFiles = tables.map((table) => table.vpxFilePath);
  const existingRomFiles = tables
    .map((table) => table.romFilePath)
    .filter(Boolean) as Array<string>;

  // find tables with missing files (vpx and rom)
  //    these are tablesWithMissingFiles
  const tablesWithMissingFiles = findTablesWithMissingFiles(tables);

  // save rom paths of each table that has a missing vpx file, but existing rom file
  //    remove those rompaths from existing rom files set
  const tableIdsWithMissingVpx = new Set(
    tablesWithMissingFiles
      .filter((item) => item.missingVpxFile)
      .map((item) => item.table.id),
  );
  const romPathsUsedByRemainingTables = new Set(
    tables
      .filter((table) => !tableIdsWithMissingVpx.has(table.id))
      .map((table) => normalizePathForComparison(table.romFilePath))
      .filter(Boolean),
  );
  // a rom shared with a table that is staying must not become an unmatched rom
  const unmatchedRomsInDatabase = tablesWithMissingFiles
    .filter(
      (item) =>
        item.table.romFile && item.missingVpxFile && !item.missingRomFile,
    )
    .map((item) => item.table.romFilePath)
    .filter(
      (romPath): romPath is string =>
        Boolean(romPath) &&
        !romPathsUsedByRemainingTables.has(normalizePathForComparison(romPath)),
    );
  const existingRomFilesWithTables = existingRomFiles.filter(
    (romFile) => !unmatchedRomsInDatabase.includes(romFile),
  );

  // scan vpx roms directory for rom files
  const scannedRoms = scanNewRoms(
    romsDirectoryPath,
    existingRomFilesWithTables,
  );
  const missingRomTableIds = new Set(
    tablesWithMissingFiles
      .filter((item) => item.missingRomFile || item.missingVpxFile)
      .map((item) => item.table.id),
  );
  const existingRomCandidates = tables
    .filter(
      (table) =>
        table.romFile && table.romFilePath && !missingRomTableIds.has(table.id),
    )
    .map((table) => ({
      path: table.romFilePath!,
      name: table.romFile!,
    }));
  const romCandidatesByPath = new Map(
    [...existingRomCandidates, ...scannedRoms].map((rom) => [rom.path, rom]),
  );

  // scan vpx tables directory for vpx files
  //    these are newTables
  const scannedTables = scanNewTables(
    tablesDirectoryPath,
    existingVpxFiles,
    Array.from(romCandidatesByPath.values()),
  );

  let backglasses: Array<FileSystemItem>;
  try {
    backglasses = scanFilesByExtension(tablesDirectoryPath, '.directb2s');
  } catch (error) {
    return apiFailure(error);
  }
  const backglassesByStem = new Map<string, FileSystemItem>();
  backglasses.forEach((backglass) => {
    const stem = normalizePathForComparison(
      path.basename(backglass.name, path.extname(backglass.name)),
    );
    if (stem && !backglassesByStem.has(stem)) {
      backglassesByStem.set(stem, backglass);
    }
  });
  const getBackglassForVpxPath = (vpxPath: string) =>
    backglassesByStem.get(
      normalizePathForComparison(path.basename(vpxPath, path.extname(vpxPath))),
    );
  scannedTables.forEach((table) => {
    table.backglass = getBackglassForVpxPath(table.filePath);
  });
  const backglassUpdates = tables.map((table) => ({
    tableId: table.id,
    tableName: table.name,
    vpxFileName: table.vpxFile,
    backglass: getBackglassForVpxPath(table.vpxFilePath),
  }));
  const matchedBackglassPaths = new Set(
    [
      ...tables.map((table) => table.vpxFilePath),
      ...scannedTables.map((table) => table.filePath),
    ]
      .map(getBackglassForVpxPath)
      .filter((backglass): backglass is FileSystemItem => Boolean(backglass))
      .map((backglass) => normalizePathForComparison(backglass.path)),
  );
  const unmatchedBackglasses = backglasses.filter(
    (backglass) =>
      !matchedBackglassPaths.has(normalizePathForComparison(backglass.path)),
  );

  // from scanned vpx tables filter out ones that have been added to newly scanned tables
  //    these are unmatchedRoms
  const unmatchedRoms = scannedRoms.filter(
    (scannedRom) =>
      !scannedTables.some((table) => table.rom?.path === scannedRom.path),
  );

  const storedSkippedPaths = new Set(
    configDb.getSkippedScanTablePaths().map(normalizePathForComparison),
  );
  const skippedTablePaths = scannedTables
    .map((table) => table.filePath)
    .filter((filePath) =>
      storedSkippedPaths.has(normalizePathForComparison(filePath)),
    );

  return apiSuccess({
    newTables: scannedTables,
    backglassUpdates,
    unmatchedBackglasses,
    skippedTablePaths,
    unmatchedRoms,
    tablesWithMissingFiles,
  });
}

export async function applyScanResult(
  scanResult: ScanResult,
): Promise<ApiResult<null>> {
  try {
    await registerTableFiles(scanResult.newTables);
    scanResult.backglassUpdates.forEach(({ tableId, backglass }) => {
      tablesDb.updateFileReference(
        tableId,
        'backglassFileId',
        'directb2s',
        backglass?.path,
      );
    });
    const tablesByPath = new Map(
      tablesDb
        .getAllResolved()
        .map((table) => [
          normalizePathForComparison(table.vpxFilePath),
          table.id,
        ]),
    );
    scanResult.newTables.forEach((tableFile) => {
      const tableId = tablesByPath.get(
        normalizePathForComparison(tableFile.filePath),
      );
      if (tableId) {
        tablesDb.updateFileReference(
          tableId,
          'backglassFileId',
          'directb2s',
          tableFile.backglass?.path,
        );
      }
    });
    for (const backglass of scanResult.unmatchedBackglasses) {
      const result = deleteUnmatchedBackglass(backglass.path);
      if (!result.success) {
        return result;
      }
    }
    deleteUnusedRoms(scanResult.unmatchedRoms);
    cleanTablesWithMissingFiles(scanResult.tablesWithMissingFiles);

    const importedPaths = new Set(
      scanResult.newTables.map((table) =>
        normalizePathForComparison(table.filePath),
      ),
    );
    const skippedPaths = new Map<string, string>();

    [
      ...configDb.getSkippedScanTablePaths(),
      ...scanResult.skippedTablePaths,
    ].forEach((filePath) => {
      const normalized = normalizePathForComparison(filePath);

      if (!importedPaths.has(normalized)) {
        skippedPaths.set(normalized, filePath);
      }
    });
    configDb.updateSkippedScanTablePaths(Array.from(skippedPaths.values()));

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function exportTables(
  destinationPath: string,
  exportGroup: GroupType,
): ApiResult<null> {
  try {
    const result = createDirectoryIfNotExists(destinationPath);

    if (!result) {
      return {
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: `Failed to create destination directory: ${destinationPath}`,
        },
      };
    }

    const allTables = tablesDb.getAllResolved();
    const tables = allTables.filter((table) => {
      switch (exportGroup) {
        case GroupType.allTablesIncludingArchived:
          return true;
        case GroupType.archived:
          return Boolean(table.isArchived);
        case GroupType.favorites:
          return !table.isArchived && table.isFavorite;
        case GroupType.allTables:
        default:
          return !table.isArchived;
      }
    });
    const failedTables: string[] = [];

    tables.forEach((table) => {
      try {
        const tableDirectoryPath = path.join(destinationPath, table.name);
        const tableDirectoryReady =
          createDirectoryIfNotExists(tableDirectoryPath);

        if (!tableDirectoryReady) {
          failedTables.push(table.name);
          return;
        }

        const vpxTargetPath = path.join(tableDirectoryPath, table.vpxFile);
        copyFile(table.vpxFilePath, vpxTargetPath);

        if (table.romFilePath && table.romFile) {
          const romTargetPath = path.join(tableDirectoryPath, table.romFile);
          copyFile(table.romFilePath, romTargetPath);
        }

        if (table.backglassFilePath && table.backglassFile) {
          const backglassTargetPath = path.join(
            tableDirectoryPath,
            table.backglassFile,
          );
          copyFile(table.backglassFilePath, backglassTargetPath);
        }
      } catch (error) {
        failedTables.push(table.name);
      }
    });

    if (failedTables.length > 0) {
      return {
        success: true,
        data: null,
        warning: {
          code: 'EXPORT_PARTIAL_FAILURE',
          message: `Failed to export ${failedTables.length} table(s) because of missing files`,
        },
      };
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function startRandomTable(
  tables: Array<ResolvedTable>,
): Promise<ApiResult<null>> {
  try {
    if (tables.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_TABLES',
          message: 'No tables available to pick from',
        },
      };
    }

    const configVpxExecutablePath = configDb.getVpxExecutablePath();
    const randomIndex = Math.floor(Math.random() * tables.length);
    const table = tablesDb.getResolved(tables[randomIndex].id);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${tables[randomIndex].id}`,
        },
      };
    }

    await startVpxTable(
      table.vpxFilePath,
      table.vpxExecutablePath || configVpxExecutablePath,
      resolveLaunchFlags(table),
    );

    tablesDb.update(table.id, {
      lastPlayedTimestamp: Date.now(),
    });

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

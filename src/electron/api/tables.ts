import { apiFailure, apiSuccess } from '.';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import type { ApiResult } from 'src/types/api';
import type { FileSystemItem, TableFile } from 'src/types/file';
import { GroupType, ScanResult, Table } from 'src/types/table';

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
import { normalizePathForComparison } from '../utils/path';
import {
  findTablesWithMissingFiles,
  scanNewRoms,
  scanNewTables,
} from '../utils/scanVpxLibrary';
import { startVpxTable } from '../utils/startVpxTable';

const isZipFile = (name: string): boolean =>
  path.extname(name).toLowerCase() === '.zip';

export function getAllTables(): ApiResult<Table[]> {
  try {
    return apiSuccess(tablesDb.getAll());
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
    const table = tablesDb.get(id);

    if (!table) {
      return {
        success: false,
        error: {
          code: 'TABLE_NOT_FOUND',
          message: `Table not found: ${id}`,
        },
      };
    }

    tablesDb.remove(id);

    deleteFile(table.vpxFilePath);

    if (table.romFilePath) {
      deleteFile(table.romFilePath);
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

export function getUnmatchedRoms(): ApiResult<Array<FileSystemItem>> {
  try {
    const tables = tablesDb.getAll();
    const romsDirectoryPath = configDb.getRomsDirectoryPath();
    const assignedRomPaths = tables
      .map((table) => table.romFilePath)
      .filter(Boolean) as Array<string>;

    const unmatchedRoms = scanNewRoms(romsDirectoryPath, assignedRomPaths);

    return apiSuccess(unmatchedRoms);
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

    const currentRomPath = table.romFilePath;
    const currentRomName = table.romFile;

    let nextRomPath: string | undefined;
    let nextRomName: string | undefined;

    if (rom) {
      const romsDirectoryPath = configDb.getRomsDirectoryPath();
      const destinationRomPath = path.join(romsDirectoryPath, rom.name);

      nextRomPath = destinationRomPath;
      nextRomName = rom.name;
    }

    const hasRomChanged =
      normalizePathForComparison(currentRomPath) !==
      normalizePathForComparison(nextRomPath);

    if (hasRomChanged && nextRomPath) {
      const isAssignedToAnotherTable = tablesDb.getAll().some((item) => {
        if (item.id === tableId || !item.romFilePath) {
          return false;
        }

        return (
          normalizePathForComparison(item.romFilePath) ===
          normalizePathForComparison(nextRomPath)
        );
      });

      if (isAssignedToAnotherTable) {
        return {
          success: false,
          error: {
            code: 'ROM_ALREADY_ASSIGNED',
            message: 'This ROM is already assigned to another table',
          },
        };
      }

      if (rom) {
        const normalizedSourceRomPath = normalizePathForComparison(rom.path);

        if (
          normalizedSourceRomPath !== normalizePathForComparison(nextRomPath)
        ) {
          copyFile(rom.path, nextRomPath);
        }
      }
    }

    const updatedTable = tablesDb.update(tableId, {
      romFile: nextRomName,
      romFilePath: nextRomPath,
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

    if (hasRomChanged && currentRomPath && currentRomName) {
      const isCurrentRomStillAssigned = tablesDb.getAll().some((item) => {
        if (item.id === tableId || !item.romFilePath) {
          return false;
        }

        return (
          normalizePathForComparison(item.romFilePath) ===
          normalizePathForComparison(currentRomPath)
        );
      });

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

export function importTables(
  tableFiles: Array<TableFile>,
  deleteAfterImport: boolean,
): ApiResult<null> {
  try {
    const transferFile = deleteAfterImport ? moveFile : copyFile;
    const movedSourceFilePaths = new Set<string>();
    let missingSourceFailures = 0;
    let permissionFailures = 0;
    const tablesDirectoryPath = configDb.getTablesDirectoryPath();
    const romsDirectoryPath = configDb.getRomsDirectoryPath();

    const existingVpxPaths = new Set(
      tablesDb
        .getAll()
        .map((table) => normalizePathForComparison(table.vpxFilePath)),
    );

    tableFiles.forEach((tableFile) => {
      try {
        const vpxSourceFilePath = tableFile.filePath;
        const romSourceFilePath = tableFile.rom?.path;

        const vpxDestinationFilePath = path.join(
          tablesDirectoryPath,
          tableFile.fileName,
        );
        const romDestinationFilePath = tableFile.rom
          ? path.join(romsDirectoryPath, tableFile.rom.name)
          : undefined;

        const normalizedDestinationPath = normalizePathForComparison(
          vpxDestinationFilePath,
        );

        if (existingVpxPaths.has(normalizedDestinationPath)) {
          return;
        }

        if (vpxSourceFilePath !== vpxDestinationFilePath) {
          transferFile(vpxSourceFilePath, vpxDestinationFilePath);

          if (deleteAfterImport) {
            movedSourceFilePaths.add(vpxSourceFilePath);
          }
        }

        if (romSourceFilePath && romDestinationFilePath) {
          if (romSourceFilePath !== romDestinationFilePath) {
            transferFile(romSourceFilePath, romDestinationFilePath);

            if (deleteAfterImport) {
              movedSourceFilePaths.add(romSourceFilePath);
            }
          }
        }

        const nextTable: Table = {
          id: uuidv4(),
          name: tableFile.name,
          vpxFile: tableFile.fileName,
          romFile: tableFile.rom?.name,
          isFavorite: false,
          isForAndroid: false,
          isArchived: false,
          vpxFilePath: vpxDestinationFilePath,
          romFilePath: romDestinationFilePath,
          dateAddedTimestamp: Date.now(),
        };

        tablesDb.create(nextTable);
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
          return;
        }

        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          (error.code === 'EACCES' || error.code === 'EPERM')
        ) {
          permissionFailures += 1;
          return;
        }

        throw error;
      }
    });

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

    await startVpxTable(
      table.vpxFilePath,
      table.vpxExecutablePath || configVpxExecutablePath,
    );

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

export function scanVpxLibrary(): ApiResult<ScanResult> {
  // info:
  // - all roms are matched by file name
  // - all table files are matched by vpx file name

  // get all tables
  // get config paths
  const tables = tablesDb.getAll();
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
  const unmatchedRomsInDatabase = tablesWithMissingFiles
    .filter(
      (item) =>
        item.table.romFile && item.missingVpxFile && !item.missingRomFile,
    )
    .map((item) => item.table.romFilePath)
    .filter(Boolean) as Array<string>;
  const existingRomFilesWithTables = existingRomFiles.filter(
    (romFile) => !unmatchedRomsInDatabase.includes(romFile),
  );

  // scan vpx roms directory for rom files
  const scannedRoms = scanNewRoms(
    romsDirectoryPath,
    existingRomFilesWithTables,
  );

  // scan vpx tables directory for vpx files
  //    these are newTables
  const scannedTables = scanNewTables(
    tablesDirectoryPath,
    existingVpxFiles,
    scannedRoms,
  );

  // from scanned vpx tables filter out ones that have been added to newly scanned tables
  //    these are unmatchedRoms
  const unmatchedRoms = scannedRoms.filter(
    (scannedRom) =>
      !scannedTables.some((table) => table.rom?.path === scannedRom.path),
  );

  return apiSuccess({
    newTables: scannedTables,
    unmatchedRoms,
    tablesWithMissingFiles,
  });
}

export function applyScanResult(scanResult: ScanResult): ApiResult<null> {
  try {
    registerTableFiles(scanResult.newTables);
    deleteUnusedRoms(scanResult.unmatchedRoms);
    cleanTablesWithMissingFiles(scanResult.tablesWithMissingFiles);

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

    const allTables = tablesDb.getAll();
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
  tables: Array<Table>,
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
    const table = tables[randomIndex];

    // ALEX TODO: test on windows

    await startVpxTable(
      table.vpxFilePath,
      table.vpxExecutablePath || configVpxExecutablePath,
    );

    tablesDb.update(table.id, {
      lastPlayedTimestamp: Date.now(),
    });

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

import { apiFailure, apiSuccess } from '.';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { VPX_DEFAULT_EXECUTABLE } from 'src/consts/vpx';
import type { ApiResult } from 'src/types/api';
import type { FileSystemItem, TableFile } from 'src/types/file';
import type { ScanResult, Table } from 'src/types/table';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import {
  copyFile,
  createDirectoryIfNotExists,
  deleteFile,
  moveFile,
  removeEmptyParentDirectories,
} from '../utils/fileManagement';
import {
  findTablesWithMissingFiles,
  scanNewRoms,
  scanNewTables,
} from '../utils/scanVpxLibrary';
import { startVpxTable } from '../utils/startVpxTable';

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

export function importTables(
  tableFiles: Array<TableFile>,
  deleteAfterImport: boolean,
): ApiResult<null> {
  try {
    const transferFile = deleteAfterImport ? moveFile : copyFile;
    const movedSourceFilePaths = new Set<string>();
    const tablesDirectoryPath = configDb.getTablesDirectoryPath();
    const romsDirectoryPath = configDb.getRomsDirectoryPath();

    const existingVpxPaths = new Set(
      tablesDb
        .getAll()
        .map((table) =>
          table.vpxFilePath.trim().toLowerCase().replace(/\\/g, '/'),
        ),
    );

    tableFiles.forEach((tableFile) => {
      const vpxSourceFilePath = tableFile.filePath;
      const romSourceFilePath = tableFile.rom?.path;

      const vpxDestinationFilePath = path.join(
        tablesDirectoryPath,
        tableFile.fileName,
      );
      const romDestinationFilePath = tableFile.rom
        ? path.join(romsDirectoryPath, tableFile.rom.name)
        : undefined;

      const normalizedDestinationPath = vpxDestinationFilePath
        .trim()
        .toLowerCase()
        .replace(/\\/g, '/');

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
        vpxFilePath: vpxDestinationFilePath,
        romFilePath: romDestinationFilePath,
        dateAddedTimestamp: Date.now(),
      };

      tablesDb.create(nextTable);
      existingVpxPaths.add(normalizedDestinationPath);
    });

    if (deleteAfterImport) {
      Array.from(movedSourceFilePaths).forEach((sourceFilePath) => {
        removeEmptyParentDirectories(sourceFilePath);
      });
    }

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

export function startTable(tableId: string): ApiResult<null> {
  try {
    const config = configDb.getConfig();
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

    tablesDb.update(tableId, {
      lastPlayedTimestamp: Date.now(),
    });

    startVpxTable(
      table.vpxFilePath,
      config.vpxRootPath,
      VPX_DEFAULT_EXECUTABLE,
    );

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

  // TODO: remove
  console.log({
    tablesWithMissingFiles: tablesWithMissingFiles.map((item) => ({
      tableName: item.table.name,
      vpxFile: item.table.vpxFilePath,
      romFile: item.table.romFilePath,
      missingVpxFile: item.missingVpxFile,
      missingRomFile: item.missingRomFile,
    })),
    existingVpxFiles,
    existingRomFiles,
    existingRomFilesWithTables,
    unmatchedRomsInDatabase,
    scannedRoms,
    scannedTables: scannedTables.map((table) => ({
      name: table.name,
      vpxFilePath: table.filePath,
      romFilePath: table.rom?.path,
      expectedRomName: table.expectedRomName,
    })),
    unmatchedRoms,
  });

  return apiSuccess({
    newTables: scannedTables,
    unmatchedRoms,
    tablesWithMissingFiles,
  });
}

function registerTableFiles(tables: Array<TableFile>): void {
  const existingVpxPaths = new Set(
    tablesDb
      .getAll()
      .map((table) =>
        table.vpxFilePath.trim().toLowerCase().replace(/\\/g, '/'),
      ),
  );

  tables.forEach((tableFile) => {
    const normalizedVpxPath = tableFile.filePath
      .trim()
      .toLowerCase()
      .replace(/\\/g, '/');

    if (existingVpxPaths.has(normalizedVpxPath)) {
      return;
    }

    const nextTable: Table = {
      id: uuidv4(),
      name: tableFile.name,
      vpxFile: tableFile.fileName,
      romFile: tableFile.rom?.name,
      vpxFilePath: tableFile.filePath,
      romFilePath: tableFile.rom?.path,
      isFavorite: false,
      dateAddedTimestamp: Date.now(),
    };

    tablesDb.create(nextTable);
    existingVpxPaths.add(normalizedVpxPath);
  });
}

function deleteUnusedRoms(roms: Array<FileSystemItem>): void {}

function cleanTablesWithMissingFiles(
  data: Array<{
    table: Table;
    missingVpxFile: boolean;
    missingRomFile: boolean;
  }>,
): void {}

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

export function exportTables(destinationPath: string): ApiResult<null> {
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

    const tables = tablesDb.getAll();

    tables.forEach((table) => {
      const tableDirectoryPath = path.join(destinationPath, table.name);
      const tableDirectoryReady =
        createDirectoryIfNotExists(tableDirectoryPath);

      if (!tableDirectoryReady) {
        throw new Error(
          `Failed to create table destination directory: ${tableDirectoryPath}`,
        );
      }

      const vpxTargetPath = path.join(tableDirectoryPath, table.vpxFile);
      copyFile(table.vpxFilePath, vpxTargetPath);

      if (table.romFilePath && table.romFile) {
        const romTargetPath = path.join(tableDirectoryPath, table.romFile);
        copyFile(table.romFilePath, romTargetPath);
      }
    });

    return apiSuccess(null);
  } catch (error) {
    return apiFailure(error);
  }
}

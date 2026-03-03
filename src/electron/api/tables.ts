import { apiFailure, apiSuccess } from '.';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { VPX_DEFAULT_EXECUTABLE } from 'src/consts/vpx';
import type { ApiResult } from 'src/types/api';
import type { TableFile } from 'src/types/file';
import type { Table } from 'src/types/table';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import {
  copyFile,
  deleteFile,
  moveFile,
  removeEmptyParentDirectories,
} from '../utils/fileManagement';
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

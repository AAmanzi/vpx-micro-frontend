import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { VPX_DEFAULT_EXECUTABLE } from 'src/consts/vpx';
import type { TableFile } from 'src/types/file';
import type { Table } from 'src/types/table';

import * as configDb from '../database/config';
import * as tablesDb from '../database/tables';
import { copyFile, deleteFile, moveFile } from '../utils/fileManagement';
import { startVpxTable } from '../utils/startVpxTable';

export function getAllTables(): Table[] {
  return tablesDb.getAll();
}

export function setTableFavorite(id: string, fav: boolean): void {
  tablesDb.setFavorite(id, fav);
}

export function deleteTable(id: string): void {
  const table = tablesDb.get(id);

  if (!table) {
    return;
  }

  tablesDb.remove(id);

  deleteFile(table.vpxFilePath);

  if (table.romFilePath) {
    deleteFile(table.romFilePath);
  }
}

export function renameTable(id: string, newName: string): void {
  tablesDb.update(id, { name: newName });
}

export function importTables(
  tableFiles: Array<TableFile>,
  deleteAfterImport: boolean,
): void {
  const transferFile = deleteAfterImport ? moveFile : copyFile;
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
    }

    if (romSourceFilePath && romDestinationFilePath) {
      if (romSourceFilePath !== romDestinationFilePath) {
        transferFile(romSourceFilePath, romDestinationFilePath);
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
    };

    tablesDb.create(nextTable);
    existingVpxPaths.add(normalizedDestinationPath);
  });
}

export function startTable(tableId: string): void {
  const config = configDb.getConfig();
  const table = tablesDb.get(tableId);

  if (!table) {
    return;
  }

  startVpxTable(table.vpxFilePath, config.vpxRootPath, VPX_DEFAULT_EXECUTABLE);
}

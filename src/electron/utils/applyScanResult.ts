import { v4 as uuidv4 } from 'uuid';

import type { FileSystemItem, TableFile } from 'src/types/file';
import type { ScanResult, Table } from 'src/types/table';

import * as tablesDb from '../database/tables';
import { deleteFile } from './fileManagement';
import { normalizePathForComparison } from './path';

export function registerTableFiles(tables: Array<TableFile>): void {
  const existingVpxPaths = new Set(
    tablesDb
      .getAll()
      .map((table) => normalizePathForComparison(table.vpxFilePath)),
  );

  tables.forEach((tableFile) => {
    const normalizedVpxPath = normalizePathForComparison(tableFile.filePath);

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
      isArchived: false,
      dateAddedTimestamp: Date.now(),
    };

    tablesDb.create(nextTable);
    existingVpxPaths.add(normalizedVpxPath);
  });
}

export function deleteUnusedRoms(roms: Array<FileSystemItem>): void {
  roms.forEach((rom) => {
    try {
      deleteFile(rom.path);
    } catch {}
  });
}

export function cleanTablesWithMissingFiles(
  data: ScanResult['tablesWithMissingFiles'],
): void {
  data.forEach((item) => {
    const { table, missingVpxFile, missingRomFile } = item;

    if (missingVpxFile) {
      tablesDb.remove(table.id);
    } else if (missingRomFile) {
      tablesDb.update(table.id, {
        romFile: undefined,
        romFilePath: undefined,
      });
    }
  });
}

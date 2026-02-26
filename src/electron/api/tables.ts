import { v4 as uuidv4 } from 'uuid';

import type { TableFile } from 'src/types/file';
import type { Table } from 'src/types/table';

import * as tablesDb from '../database/tables';

export function getAllTables(): Table[] {
  return tablesDb.getAll();
}

export function setTableFavorite(id: string, fav: boolean): void {
  tablesDb.setFavorite(id, fav);
}

export function deleteTable(id: string): void {
  tablesDb.remove(id);
}

export function renameTable(id: string, newName: string): void {
  tablesDb.update(id, { name: newName });
}

export function importTables(tables: Array<TableFile>): void {
  const existingVpxPaths = new Set(
    tablesDb
      .getAll()
      .map((table) =>
        table.vpxFilePath.trim().toLowerCase().replace(/\\/g, '/'),
      ),
  );

  tables.forEach((table) => {
    const normalizedPath = table.filePath
      .trim()
      .toLowerCase()
      .replace(/\\/g, '/');

    if (existingVpxPaths.has(normalizedPath)) {
      return;
    }

    const nextTable: Table = {
      id: uuidv4(),
      name: table.name,
      vpxFile: table.fileName,
      romFile: table.rom?.name,
      isFavorite: false,
      vpxFilePath: table.filePath,
      romFilePath: table.rom?.path,
    };

    tablesDb.create(nextTable);
    existingVpxPaths.add(normalizedPath);
  });
}

export function startTable(tableId: string): void {
  // TODO
}

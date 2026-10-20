import { v4 as uuidv4 } from 'uuid';

import type { FileSystemItem, TableFile } from 'src/types/file';
import type { ScanResult, Table } from 'src/types/table';

import * as tablesDb from '../database/tables';
import { deleteFile } from './fileManagement';
import { normalizePathForComparison } from './path';
import { lookupTableImageUrl } from './tableImages';

export async function registerTableFiles(
  tables: Array<TableFile>,
): Promise<void> {
  const existingVpxPaths = new Set(
    tablesDb
      .getAllResolved()
      .map((table) => normalizePathForComparison(table.vpxFilePath)),
  );

  for (const tableFile of tables) {
    const normalizedVpxPath = normalizePathForComparison(tableFile.filePath);

    if (existingVpxPaths.has(normalizedVpxPath)) {
      continue;
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
      tableFile.filePath,
      tableFile.rom?.path,
    );
    existingVpxPaths.add(normalizedVpxPath);
  }
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
      tablesDb.updateFileReference(table.id, 'romFileId', 'rom');
    }
  });
}

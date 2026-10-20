import { v4 as uuidv4 } from 'uuid';

import type { LibraryFile, LibraryFileType, Table } from 'src/types/table';

import { getLibraryFilePathKey } from '../../utils/path';
import { libraryStore } from '../libraryStore';
import { backupLibraryMigration } from './backup';
import type { Migration } from './types';

interface LegacyTable extends Omit<
  Table,
  'vpxFileId' | 'romFileId' | 'backglassFileId'
> {
  vpxFile: string;
  romFile?: string;
  vpxFilePath: string;
  romFilePath?: string;
}

const migrateLibraryStore = (): void => {
  const snapshot = libraryStore.store;
  const rawTables: unknown = snapshot.tables;

  if (!rawTables || typeof rawTables !== 'object' || Array.isArray(rawTables)) {
    throw new Error('Cannot migrate library: tables data is not an object');
  }

  const legacyTables = rawTables as Record<string, LegacyTable | Table>;
  const migratedTables: Record<string, Table> = {};
  const files: Record<string, LibraryFile> = snapshot.files;
  const fileIdsByPath = new Map<string, string>();

  Object.values(files).forEach((file) => {
    fileIdsByPath.set(getLibraryFilePathKey(file.path), file.id);
  });

  const registerFile = (
    type: LibraryFileType,
    filePath?: string,
  ): string | undefined => {
    if (!filePath) {
      return undefined;
    }

    const normalizedPath = getLibraryFilePathKey(filePath);
    const existingFileId = fileIdsByPath.get(normalizedPath);

    if (existingFileId) {
      const existingFile = files[existingFileId];

      if (existingFile.type !== type) {
        throw new Error(
          `Library path is assigned conflicting file types: ${filePath}`,
        );
      }

      return existingFileId;
    }

    const id = uuidv4();
    files[id] = { id, type, path: filePath };
    fileIdsByPath.set(normalizedPath, id);
    return id;
  };

  Object.entries(legacyTables).forEach(([id, legacyTable]) => {
    if (!legacyTable || typeof legacyTable !== 'object') {
      throw new Error(`Cannot migrate invalid table data: ${id}`);
    }

    if ('vpxFileId' in legacyTable) {
      const references = [
        [legacyTable.vpxFileId, 'table'],
        [legacyTable.romFileId, 'rom'],
        [legacyTable.backglassFileId, 'directb2s'],
      ] as const;

      for (const [fileId, type] of references) {
        if (
          (type === 'table' || fileId !== undefined) &&
          (!fileId || files[fileId]?.type !== type)
        ) {
          throw new Error(
            `Cannot migrate table with an invalid ${type} reference: ${id}`,
          );
        }
      }

      migratedTables[id] = legacyTable;
      return;
    }

    if (!legacyTable.vpxFilePath) {
      throw new Error(`Cannot migrate table without a VPX path: ${id}`);
    }

    const vpxFileId = registerFile('table', legacyTable.vpxFilePath);
    const romFileId = registerFile('rom', legacyTable.romFilePath);

    if (!vpxFileId) {
      throw new Error(`Cannot migrate table without a VPX file: ${id}`);
    }

    const {
      vpxFile: _vpxFile,
      romFile: _romFile,
      vpxFilePath: _vpxFilePath,
      romFilePath: _romFilePath,
      ...metadata
    } = legacyTable;

    migratedTables[id] = {
      ...metadata,
      id,
      vpxFileId,
      romFileId,
    };
  });

  backupLibraryMigration(libraryStore.path);
  libraryStore.store = {
    ...snapshot,
    tables: migratedTables,
    files,
  };
};

const migration: Migration = {
  id: 'library-schema-v1',
  run: migrateLibraryStore,
  failurePolicy: 'abort',
};

export default migration;

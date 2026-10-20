import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import type {
  LibraryFile,
  LibraryFileType,
  ResolvedTable,
  Table,
} from 'src/types/table';

import { getLibraryFilePathKey } from '../utils/path';
import { libraryStore as store } from './libraryStore';

const writeStore = (
  tables: Record<string, Table>,
  files: Record<string, LibraryFile>,
): void => {
  store.store = { tables, files };
};

const resolveFile = (
  fileId: string | undefined,
  expectedType: LibraryFileType,
  files: Record<string, LibraryFile>,
): LibraryFile | undefined => {
  if (!fileId) {
    return undefined;
  }

  const file = files[fileId];

  if (!file || file.type !== expectedType) {
    return undefined;
  }

  return file;
};

const toResolvedTable = (
  table: Table,
  files: Record<string, LibraryFile>,
): ResolvedTable => {
  const vpxFile = resolveFile(table.vpxFileId, 'table', files);
  const romFile = resolveFile(table.romFileId, 'rom', files);
  const backglassFile = resolveFile(table.backglassFileId, 'directb2s', files);

  if (!vpxFile) {
    throw new Error(`Table ${table.id} has no valid VPX file reference`);
  }

  if (table.romFileId && !romFile) {
    throw new Error(`Table ${table.id} has no valid ROM file reference`);
  }

  if (table.backglassFileId && !backglassFile) {
    throw new Error(`Table ${table.id} has no valid DirectB2S file reference`);
  }

  return {
    ...table,
    vpxFile: path.basename(vpxFile.path),
    vpxFilePath: vpxFile.path,
    romFile: romFile ? path.basename(romFile.path) : undefined,
    romFilePath: romFile?.path,
    backglassFile: backglassFile
      ? path.basename(backglassFile.path)
      : undefined,
    backglassFilePath: backglassFile?.path,
  };
};

const removeUnreferencedFiles = (
  tables: Record<string, Table>,
  files: Record<string, LibraryFile>,
): Record<string, LibraryFile> => {
  const referencedFileIds = new Set<string>();

  Object.values(tables).forEach((table) => {
    referencedFileIds.add(table.vpxFileId);

    if (table.romFileId) {
      referencedFileIds.add(table.romFileId);
    }

    if (table.backglassFileId) {
      referencedFileIds.add(table.backglassFileId);
    }
  });

  return Object.fromEntries(
    Object.entries(files).filter(([id]) => referencedFileIds.has(id)),
  );
};

const createOrReuseFile = (
  type: LibraryFileType,
  filePath: string,
  files: Record<string, LibraryFile>,
): LibraryFile => {
  if (!filePath.trim()) {
    throw new Error('Library file path is required');
  }

  if (
    type === 'directb2s' &&
    path.extname(filePath).toLowerCase() !== '.directb2s'
  ) {
    throw new Error(
      `DirectB2S file must use the .directb2s extension: ${filePath}`,
    );
  }

  const normalizedPath = getLibraryFilePathKey(filePath);
  const existing = Object.values(files).find(
    (file) => getLibraryFilePathKey(file.path) === normalizedPath,
  );

  if (existing) {
    if (existing.type !== type) {
      throw new Error(
        `Library path is assigned conflicting file types: ${filePath}`,
      );
    }

    return existing;
  }

  const file: LibraryFile = { id: uuidv4(), type, path: filePath };
  files[file.id] = file;
  return file;
};

export function getAll(): Table[] {
  return Object.values(store.store.tables).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getAllResolved(): ResolvedTable[] {
  const { tables, files } = store.store;
  return Object.values(tables)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((table) => toResolvedTable(table, files));
}

export function createWithFiles(
  item: Omit<Table, 'vpxFileId' | 'romFileId' | 'backglassFileId'>,
  vpxFilePath: string,
  romFilePath?: string,
): Table {
  const { tables, files } = store.store;
  const vpxFile = createOrReuseFile('table', vpxFilePath, files);
  const romFile = romFilePath
    ? createOrReuseFile('rom', romFilePath, files)
    : undefined;
  const table: Table = {
    ...item,
    vpxFileId: vpxFile.id,
    romFileId: romFile?.id,
  };

  tables[table.id] = table;
  writeStore(tables, removeUnreferencedFiles(tables, files));
  return table;
}

export function getFile(
  fileId: string | undefined,
  type: LibraryFileType,
): LibraryFile | undefined {
  return resolveFile(fileId, type, store.store.files);
}

export function getFilesByType(type: LibraryFileType): LibraryFile[] {
  return Object.values(store.store.files).filter((file) => file.type === type);
}

export function update(id: string, item: Partial<Table>): Table | null {
  const { tables, files } = store.store;
  const existing = tables[id];

  if (!existing) {
    return null;
  }

  const merged = { ...existing, ...item };
  tables[id] = merged;
  writeStore(tables, removeUnreferencedFiles(tables, files));
  return merged;
}

export function updateFileReference(
  id: string,
  field: 'romFileId' | 'backglassFileId',
  type: 'rom' | 'directb2s',
  filePath?: string,
): Table | null {
  if ((field === 'romFileId') !== (type === 'rom')) {
    throw new Error(`Invalid file reference field for file type: ${type}`);
  }

  const { tables, files } = store.store;
  const existing = tables[id];

  if (!existing) {
    return null;
  }

  const file = filePath ? createOrReuseFile(type, filePath, files) : undefined;

  if (
    type === 'directb2s' &&
    file &&
    Object.values(tables).some(
      (table) => table.id !== id && table.backglassFileId === file.id,
    )
  ) {
    throw new Error(
      `DirectB2S file is already assigned to another table: ${filePath}`,
    );
  }

  const updated = { ...existing, [field]: file?.id };
  tables[id] = updated;
  writeStore(tables, removeUnreferencedFiles(tables, files));
  return updated;
}

export function remove(id: string): boolean {
  const { tables, files } = store.store;

  if (!tables[id]) {
    return false;
  }

  delete tables[id];
  writeStore(tables, removeUnreferencedFiles(tables, files));
  return true;
}

export function setFavorite(id: string, fav: boolean): Table | null {
  return update(id, { isFavorite: fav });
}

export function setForAndroid(id: string, isForAndroid: boolean): Table | null {
  return update(id, { isForAndroid });
}

export function setArchived(id: string, archived: boolean): Table | null {
  return update(id, { isArchived: archived });
}

export function get(id: string): Table | null {
  return store.store.tables[id] || null;
}

export function getResolved(id: string): ResolvedTable | null {
  const { tables, files } = store.store;
  const table = tables[id];
  return table ? toResolvedTable(table, files) : null;
}

export function seed(items: ResolvedTable[]) {
  const map: Record<string, Table> = {};
  const files: Record<string, LibraryFile> = {};

  items.forEach((resolvedTable) => {
    const vpxFile = createOrReuseFile(
      'table',
      resolvedTable.vpxFilePath,
      files,
    );
    const romFile = resolvedTable.romFilePath
      ? createOrReuseFile('rom', resolvedTable.romFilePath, files)
      : undefined;
    const {
      vpxFile: _vpxFile,
      romFile: _romFile,
      vpxFilePath: _vpxFilePath,
      romFilePath: _romFilePath,
      backglassFile: _backglassFile,
      backglassFilePath: _backglassFilePath,
      ...metadata
    } = resolvedTable;

    map[resolvedTable.id] = {
      ...metadata,
      vpxFileId: vpxFile.id,
      romFileId: romFile?.id,
    };
  });

  writeStore(map, removeUnreferencedFiles(map, files));
  return Object.keys(map).length;
}

export function clear(): void {
  writeStore({}, {});
}

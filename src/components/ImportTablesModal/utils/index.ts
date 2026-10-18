import path from 'path';

import { api } from 'src/consts';
import { FileSystemItem, TableFile } from 'src/types/file';
import { Table } from 'src/types/table';
import { normalizePathForComparison } from 'src/utils';

import { ImportSelectionResult } from '../types';
import { applyExpectedRoms } from './rules';

const isVpxFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.vpx');

const isRomFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.zip');

const createTableFile = async (
  file: FileSystemItem,
  vpxCountByDirectoryPath: Map<string, number>,
): Promise<TableFile> => {
  let expectedRomName: string | undefined;

  try {
    expectedRomName =
      (await api.getExpectedRomName(file.path)).data ?? undefined;
  } catch {
    expectedRomName = undefined;
  }

  const defaultName = file.name.replace(/\.vpx$/i, '').trim();
  const directoryPath = path.dirname(file.path);
  const directoryName = path.basename(directoryPath).trim();
  const shouldUseDirectoryName =
    vpxCountByDirectoryPath.get(directoryPath) === 1 &&
    directoryName.length > 0;

  return {
    name: shouldUseDirectoryName ? directoryName : defaultName,
    filePath: file.path,
    fileName: file.name,
    expectedRomName,
  };
};

export const buildImportSelectionResult = async ({
  currentTables,
  currentUnassignedRoms,
  incomingFiles,
  libraryRoms,
}: {
  currentTables: Array<TableFile>;
  currentUnassignedRoms: Array<FileSystemItem>;
  incomingFiles: Array<FileSystemItem>;
  libraryRoms: Array<FileSystemItem>;
}): Promise<ImportSelectionResult> => {
  const knownTablePaths = new Set(currentTables.map((table) => table.filePath));
  const knownRomPaths = new Set([
    ...currentUnassignedRoms.map((rom) => rom.path),
    ...currentTables.map((table) => table.rom?.path).filter(Boolean),
  ]);

  const incomingVpxFiles = incomingFiles
    .filter(isVpxFile)
    .filter((file) => !knownTablePaths.has(file.path));

  const vpxCountByDirectoryPath = incomingVpxFiles.reduce<Map<string, number>>(
    (acc, file) => {
      const directoryPath = path.dirname(file.path);

      acc.set(directoryPath, (acc.get(directoryPath) || 0) + 1);

      return acc;
    },
    new Map<string, number>(),
  );

  const newTables = await Promise.all(
    incomingVpxFiles.map((file) =>
      createTableFile(file, vpxCountByDirectoryPath),
    ),
  );

  const newRoms = incomingFiles
    .filter(isRomFile)
    .filter((file) => !knownRomPaths.has(file.path));

  const nextTables = [...currentTables, ...newTables];
  const romsByPath = new Map(
    [
      ...currentUnassignedRoms,
      ...currentTables
        .map((table) => table.rom)
        .filter((rom): rom is FileSystemItem => Boolean(rom)),
      ...newRoms,
      ...libraryRoms,
    ].map((rom) => [rom.path, rom]),
  );

  const result = applyExpectedRoms(nextTables, Array.from(romsByPath.values()));
  const libraryRomPaths = new Set(
    libraryRoms.map((rom) => normalizePathForComparison(rom.path)),
  );

  return {
    ...result,
    unassignedRoms: result.unassignedRoms.filter(
      (rom) => !libraryRomPaths.has(normalizePathForComparison(rom.path)),
    ),
  };
};

export const filterExistingFiles = ({
  tables,
  files,
}: {
  tables: Array<Table>;
  files: Array<FileSystemItem>;
}): Array<FileSystemItem> => {
  const getFileName = (value: string): string =>
    value.split(/[/\\]/).pop() || value;

  const normalizeName = (value: string): string =>
    getFileName(value).trim().toLowerCase();

  const existingVpxFiles = new Set(
    tables.map((table) => normalizeName(table.vpxFile)),
  );
  const existingRomFiles = new Set(
    tables
      .map((table) => table.romFile)
      .filter((romFile): romFile is string => Boolean(romFile))
      .map(normalizeName),
  );

  return files.filter((file) => {
    const incomingName = normalizeName(file.name);

    if (isVpxFile(file)) {
      return !existingVpxFiles.has(incomingName);
    }

    if (isRomFile(file)) {
      return !existingRomFiles.has(incomingName);
    }

    return true;
  });
};

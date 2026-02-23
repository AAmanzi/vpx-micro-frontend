import { api } from 'src/consts';
import { FileSystemItem } from 'src/types/file';

import { ImportSelectionResult, TableFile } from '../types';
import { applyExpectedRoms } from './rules';

const isVpxFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.vpx');

const isRomFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.zip');

const createTableFile = async (file: FileSystemItem): Promise<TableFile> => {
  let expectedRomName: string | undefined;

  try {
    expectedRomName = (await api.getExpectedRomName(file.path)) ?? undefined;
  } catch {
    expectedRomName = undefined;
  }

  return {
    name: file.name.replace(/\.vpx$/i, '').trim(),
    filePath: file.path,
    fileName: file.name,
    expectedRomName,
  };
};

export const buildImportSelectionResult = async ({
  currentTables,
  currentUnassignedRoms,
  incomingFiles,
}: {
  currentTables: Array<TableFile>;
  currentUnassignedRoms: Array<FileSystemItem>;
  incomingFiles: Array<FileSystemItem>;
}): Promise<ImportSelectionResult> => {
  const knownTablePaths = new Set(currentTables.map((table) => table.filePath));
  const knownRomPaths = new Set([
    ...currentUnassignedRoms.map((rom) => rom.path),
    ...currentTables.map((table) => table.rom?.path).filter(Boolean),
  ]);

  const newTables = await Promise.all(
    incomingFiles
      .filter(isVpxFile)
      .filter((file) => !knownTablePaths.has(file.path))
      .map(createTableFile),
  );

  const newRoms = incomingFiles
    .filter(isRomFile)
    .filter((file) => !knownRomPaths.has(file.path));

  const nextTables = [...currentTables, ...newTables];
  const nextUnassignedRoms = [...currentUnassignedRoms, ...newRoms];

  return applyExpectedRoms(nextTables, nextUnassignedRoms);
};

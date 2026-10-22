import path from 'path';

import { api } from 'src/consts';
import { FileSystemItem, TableFile } from 'src/types/file';
import { ResolvedTable } from 'src/types/table';
import { normalizePathForComparison } from 'src/utils';

import { ExistingTableBackglass, ImportSelectionResult } from '../types';
import { applyExpectedRoms } from './rules';

const isVpxFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.vpx');

const isRomFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.zip');

const isBackglassFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.directb2s');

const getFileStem = (fileName: string): string =>
  path.basename(fileName, path.extname(fileName)).trim().toLowerCase();

export const matchTableInis = (
  tables: Array<TableFile>,
  files: Array<FileSystemItem>,
): {
  tablesToImport: Array<TableFile>;
  unmatchedInis: Array<FileSystemItem>;
} => {
  const inis = new Map<string, FileSystemItem>();
  files.forEach((file) => {
    if (file.name.toLowerCase().endsWith('.ini')) {
      inis.set(normalizePathForComparison(file.path), file);
    }
  });
  const matchedPaths = new Set<string>();
  const tablesToImport = tables.map((table) => {
    const stem = getFileStem(table.fileName);
    const candidates = Array.from(inis.values()).filter(
      (ini) => getFileStem(ini.name) === stem,
    );
    const localCandidates = candidates.filter(
      (ini) =>
        normalizePathForComparison(path.dirname(ini.path)) ===
        normalizePathForComparison(path.dirname(table.filePath)),
    );
    const matchingTables = tables.filter(
      (item) => getFileStem(item.fileName) === stem,
    );
    const localTables = matchingTables.filter(
      (item) =>
        normalizePathForComparison(path.dirname(item.filePath)) ===
        normalizePathForComparison(path.dirname(table.filePath)),
    );
    const ini =
      localCandidates.length === 1 && localTables.length === 1
        ? localCandidates[0]
        : localCandidates.length === 0 &&
            candidates.length === 1 &&
            matchingTables.length === 1
          ? candidates[0]
          : undefined;
    if (ini) {
      matchedPaths.add(normalizePathForComparison(ini.path));
    }
    return { ...table, ini };
  });
  return {
    tablesToImport,
    unmatchedInis: Array.from(inis.values()).filter(
      (ini) => !matchedPaths.has(normalizePathForComparison(ini.path)),
    ),
  };
};

export const filterExistingBackglassAssignments = (
  tablesToImport: Array<TableFile>,
  existingAssignments: Array<ExistingTableBackglass>,
): Array<ExistingTableBackglass> => {
  const assignedPaths = new Set(
    tablesToImport
      .filter((table) => table.backglass)
      .map((table) => normalizePathForComparison(table.backglass?.path)),
  );

  return existingAssignments.filter(
    (item) =>
      !assignedPaths.has(normalizePathForComparison(item.backglass.path)),
  );
};

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
  currentUnassignedBackglasses,
  currentExistingTableBackglasses,
  currentUnmatchedInis,
  incomingFiles,
  libraryRoms,
  existingTables,
}: {
  currentTables: Array<TableFile>;
  currentUnassignedRoms: Array<FileSystemItem>;
  currentUnassignedBackglasses: Array<FileSystemItem>;
  currentExistingTableBackglasses: Array<ExistingTableBackglass>;
  currentUnmatchedInis: Array<FileSystemItem>;
  incomingFiles: Array<FileSystemItem>;
  libraryRoms: Array<FileSystemItem>;
  existingTables: Array<ResolvedTable>;
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

  const knownBackglassPaths = new Set(
    [
      ...currentUnassignedBackglasses,
      ...currentTables
        .map((table) => table.backglass)
        .filter((backglass): backglass is FileSystemItem => Boolean(backglass)),
      ...currentExistingTableBackglasses.map((item) => item.backglass),
    ].map((backglass) => normalizePathForComparison(backglass.path)),
  );
  const newBackglasses = incomingFiles
    .filter(isBackglassFile)
    .filter(
      (backglass) =>
        !knownBackglassPaths.has(normalizePathForComparison(backglass.path)),
    );
  const backglassesByStem = new Map<string, Array<FileSystemItem>>();
  [...currentUnassignedBackglasses, ...newBackglasses].forEach((backglass) => {
    const stem = getFileStem(backglass.name);
    const candidates = backglassesByStem.get(stem) ?? [];
    candidates.push(backglass);
    backglassesByStem.set(stem, candidates);
  });

  const nextTables = [...currentTables, ...newTables].map((table) => {
    if (table.backglass) {
      return table;
    }

    const matches = backglassesByStem.get(getFileStem(table.fileName));
    return matches?.length === 1 ? { ...table, backglass: matches[0] } : table;
  });

  const assignedBackglassPaths = new Set(
    nextTables
      .map((table) => table.backglass?.path)
      .filter((filePath): filePath is string => Boolean(filePath))
      .map(normalizePathForComparison),
  );
  const existingAssignments = filterExistingBackglassAssignments(
    nextTables,
    currentExistingTableBackglasses,
  );
  existingTables.forEach((table) => {
    if (
      table.backglassFilePath ||
      existingAssignments.some((item) => item.tableId === table.id)
    ) {
      return;
    }

    const matches = backglassesByStem.get(getFileStem(table.vpxFile));
    if (matches?.length === 1) {
      const backglass = matches[0];
      const normalizedPath = normalizePathForComparison(backglass.path);
      if (!assignedBackglassPaths.has(normalizedPath)) {
        existingAssignments.push({
          tableId: table.id,
          tableName: table.name,
          vpxFileName: table.vpxFile,
          backglass,
        });
        assignedBackglassPaths.add(normalizedPath);
      }
    }
  });

  const backglassFiles = new Map<string, FileSystemItem>();
  [...currentUnassignedBackglasses, ...newBackglasses].forEach((backglass) => {
    backglassFiles.set(normalizePathForComparison(backglass.path), backglass);
  });
  const assignedExistingBackglassPaths = new Set(
    existingAssignments.map((item) =>
      normalizePathForComparison(item.backglass.path),
    ),
  );
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
    ...matchTableInis(result.tablesToImport, [
      ...currentUnmatchedInis,
      ...currentTables.flatMap((table) => (table.ini ? [table.ini] : [])),
      ...incomingFiles,
    ]),
    unassignedBackglasses: Array.from(backglassFiles.values()).filter(
      (backglass) => {
        const normalizedPath = normalizePathForComparison(backglass.path);
        return (
          !assignedBackglassPaths.has(normalizedPath) &&
          !assignedExistingBackglassPaths.has(normalizedPath)
        );
      },
    ),
    existingTableBackglasses: existingAssignments,
    unassignedRoms: result.unassignedRoms.filter(
      (rom) => !libraryRomPaths.has(normalizePathForComparison(rom.path)),
    ),
  };
};

export const filterExistingFiles = ({
  tables,
  files,
}: {
  tables: Array<ResolvedTable>;
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
  const existingBackglassPaths = new Set(
    tables
      .map((table) => table.backglassFilePath)
      .filter((filePath): filePath is string => Boolean(filePath))
      .map(normalizePathForComparison),
  );
  const existingBackglassFiles = new Set(
    tables
      .map((table) => table.backglassFile)
      .filter((fileName): fileName is string => Boolean(fileName))
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

    if (
      isBackglassFile(file) &&
      (existingBackglassFiles.has(incomingName) ||
        existingBackglassPaths.has(normalizePathForComparison(file.path)))
    ) {
      return false;
    }

    return true;
  });
};

import fs from 'fs';
import path from 'path';

import { FileSystemItem, TableFile } from 'src/types/file';
import { Table } from 'src/types/table';

import { normalizePathForComparison, resolveUserPath } from './path';
import { getExpectedRomNameFromVpxFile } from './vpxParsing';

export const scanNewRoms = (
  directoryPath: string,
  existingRoms: Array<string>,
): Array<FileSystemItem> => {
  if (!directoryPath) {
    return [];
  }

  const normalizedDirectoryPath = resolveUserPath(directoryPath);

  if (!normalizedDirectoryPath) {
    return [];
  }

  const existingRomNames = new Set(
    existingRoms
      .map((rom) => normalizePathForComparison(path.basename(rom)))
      .filter(Boolean),
  );

  const discoveredRoms: Array<FileSystemItem> = [];
  const visitedRomNames = new Set(existingRomNames);
  const directoriesToScan = [normalizedDirectoryPath];

  while (directoriesToScan.length > 0) {
    const currentDirectoryPath = directoriesToScan.pop();

    if (!currentDirectoryPath) {
      continue;
    }

    let entries: Array<fs.Dirent> = [];

    try {
      entries = fs.readdirSync(currentDirectoryPath, { withFileTypes: true });
    } catch {
      continue;
    }

    entries.forEach((entry) => {
      if (entry.isSymbolicLink()) {
        return;
      }

      const entryPath = path.join(currentDirectoryPath, entry.name);

      if (entry.isDirectory()) {
        directoriesToScan.push(entryPath);
        return;
      }

      if (!entry.isFile()) {
        return;
      }

      if (path.extname(entry.name).toLowerCase() !== '.zip') {
        return;
      }

      const normalizedName = normalizePathForComparison(entry.name);

      if (visitedRomNames.has(normalizedName)) {
        return;
      }

      visitedRomNames.add(normalizedName);
      discoveredRoms.push({
        path: entryPath,
        name: entry.name,
      });
    });
  }

  return discoveredRoms;
};

export const scanNewTables = (
  directoryPath: string,
  existingVpxFiles: Array<string>,
  roms: Array<FileSystemItem>,
): Array<TableFile> => {
  if (!directoryPath) {
    return [];
  }

  const normalizedDirectoryPath = resolveUserPath(directoryPath);

  if (!normalizedDirectoryPath) {
    return [];
  }

  const existingTableFileNames = new Set(
    existingVpxFiles
      .map((filePath) => normalizePathForComparison(path.basename(filePath)))
      .filter(Boolean),
  );

  const romsByName = new Map<string, FileSystemItem>();
  roms.forEach((rom) => {
    const withExtension = normalizePathForComparison(rom.name);
    const withoutExtension = normalizePathForComparison(
      path.basename(rom.name, path.extname(rom.name)),
    );

    if (withExtension && !romsByName.has(withExtension)) {
      romsByName.set(withExtension, rom);
    }

    if (withoutExtension && !romsByName.has(withoutExtension)) {
      romsByName.set(withoutExtension, rom);
    }
  });

  const discoveredTables: Array<TableFile> = [];
  const visitedTableFileNames = new Set(existingTableFileNames);
  const directoriesToScan = [normalizedDirectoryPath];

  while (directoriesToScan.length > 0) {
    const currentDirectoryPath = directoriesToScan.pop();

    if (!currentDirectoryPath) {
      continue;
    }

    let entries: Array<fs.Dirent> = [];

    try {
      entries = fs.readdirSync(currentDirectoryPath, { withFileTypes: true });
    } catch {
      continue;
    }

    entries.forEach((entry) => {
      if (entry.isSymbolicLink()) {
        return;
      }

      const entryPath = path.join(currentDirectoryPath, entry.name);

      if (entry.isDirectory()) {
        directoriesToScan.push(entryPath);
        return;
      }

      if (!entry.isFile()) {
        return;
      }

      if (path.extname(entry.name).toLowerCase() !== '.vpx') {
        return;
      }

      const normalizedFileName = normalizePathForComparison(entry.name);

      if (visitedTableFileNames.has(normalizedFileName)) {
        return;
      }

      visitedTableFileNames.add(normalizedFileName);

      let expectedRomName: string | null = null;

      try {
        expectedRomName = getExpectedRomNameFromVpxFile(entryPath);
      } catch {
        expectedRomName = null;
      }

      const normalizedExpectedRomName = normalizePathForComparison(
        expectedRomName || '',
      );
      const matchedRom = normalizedExpectedRomName
        ? romsByName.get(normalizedExpectedRomName)
        : undefined;

      discoveredTables.push({
        name: path.basename(entry.name, path.extname(entry.name)),
        filePath: entryPath,
        fileName: entry.name,
        rom: matchedRom,
        expectedRomName: expectedRomName ?? undefined,
      });
    });
  }

  return discoveredTables;
};

export const findTablesWithMissingFiles = (
  tables: Array<Table>,
): Array<{
  table: Table;
  missingVpxFile: boolean;
  missingRomFile: boolean;
}> => {
  const resolveFilePath = (filePath?: string): string | null => {
    if (!filePath) {
      return null;
    }

    const resolvedPath = resolveUserPath(filePath);

    if (!resolvedPath) {
      return null;
    }

    return resolvedPath;
  };

  const fileExists = (filePath?: string): boolean => {
    const resolvedPath = resolveFilePath(filePath);

    if (!resolvedPath) {
      return false;
    }

    try {
      return fs.statSync(resolvedPath).isFile();
    } catch {
      return false;
    }
  };

  const tablesWithMissingFiles: Array<{
    table: Table;
    missingVpxFile: boolean;
    missingRomFile: boolean;
  }> = [];

  tables.forEach((table) => {
    const missingVpxFile = !fileExists(table.vpxFilePath);
    const missingRomFile =
      Boolean(resolveFilePath(table.romFilePath)) &&
      !fileExists(table.romFilePath);

    if (!missingVpxFile && !missingRomFile) {
      return;
    }

    tablesWithMissingFiles.push({
      table,
      missingVpxFile,
      missingRomFile,
    });
  });

  return tablesWithMissingFiles;
};

import fs from 'fs';
import os from 'os';
import path from 'path';

import { FileSystemItem, TableFile } from 'src/types/file';
import { Table } from 'src/types/table';

import { getExpectedRomNameFromVpxFile } from './vpxParsing';

export const scanNewRoms = (
  directoryPath: string,
  existingRoms: Array<string>,
): Array<FileSystemItem> => {
  if (!directoryPath) {
    return [];
  }

  const normalizedDirectoryPath = /^~(?=$|[\\/])/.test(directoryPath.trim())
    ? path.join(os.homedir(), directoryPath.trim().slice(1))
    : directoryPath.trim();

  if (!normalizedDirectoryPath) {
    return [];
  }

  const existingRomNames = new Set(
    existingRoms
      .map((rom) => path.basename(rom).trim().toLowerCase())
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

      const normalizedName = entry.name.trim().toLowerCase();

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

  const normalizedDirectoryPath = /^~(?=$|[\\/])/.test(directoryPath.trim())
    ? path.join(os.homedir(), directoryPath.trim().slice(1))
    : directoryPath.trim();

  if (!normalizedDirectoryPath) {
    return [];
  }

  const existingTableFileNames = new Set(
    existingVpxFiles
      .map((filePath) => path.basename(filePath).trim().toLowerCase())
      .filter(Boolean),
  );

  const romsByName = new Map<string, FileSystemItem>();
  roms.forEach((rom) => {
    const withExtension = rom.name.trim().toLowerCase();
    const withoutExtension = path
      .basename(rom.name, path.extname(rom.name))
      .trim()
      .toLowerCase();

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

      const normalizedFileName = entry.name.trim().toLowerCase();

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

      const normalizedExpectedRomName = expectedRomName?.trim().toLowerCase();
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

    const normalizedPath = filePath.trim();

    if (!normalizedPath) {
      return null;
    }

    if (/^~(?=$|[\\/])/.test(normalizedPath)) {
      return path.join(os.homedir(), normalizedPath.slice(1));
    }

    return normalizedPath;
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

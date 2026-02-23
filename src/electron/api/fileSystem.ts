import fs from 'fs';
import path from 'path';

import type { FileSystemItem } from 'src/types/file';

import { getExpectedRomNameFromVpxFile } from '../utils/vpxParsing';

const listDirectoryItems = async (
  directoryPath: string,
  acceptedExtensions: Set<string>,
): Promise<Array<FileSystemItem>> => {
  let entries: Array<fs.Dirent> = [];

  try {
    entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const items: Array<FileSystemItem> = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const children = await listDirectoryItems(entryPath, acceptedExtensions);
      items.push(...children);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!acceptedExtensions.has(extension)) {
      continue;
    }

    items.push({
      path: entryPath,
      name: entry.name,
    });
  }

  return items;
};

export function getExpectedRomName(vpxFilePath: string): string | null {
  return getExpectedRomNameFromVpxFile(vpxFilePath);
}

export function getDirectoryTree(
  directoryPath: string,
  acceptedExtensions: string[],
): Promise<Array<FileSystemItem>> {
  if (!directoryPath || !Array.isArray(acceptedExtensions)) {
    return Promise.resolve([]);
  }

  const extensionSet = new Set(
    acceptedExtensions
      .map((extension) => extension.toLowerCase())
      .filter(Boolean),
  );

  if (extensionSet.size === 0) {
    return Promise.resolve([]);
  }

  return listDirectoryItems(directoryPath, extensionSet);
}

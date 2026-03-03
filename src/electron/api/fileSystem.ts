import { apiFailure, apiSuccess } from '.';
import fs from 'fs';
import path from 'path';

import type { ApiResult } from 'src/types/api';
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

export function getExpectedRomName(
  vpxFilePath: string,
): ApiResult<string | null> {
  try {
    return apiSuccess(getExpectedRomNameFromVpxFile(vpxFilePath));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function getDirectoryTree(
  directoryPath: string,
  acceptedExtensions: string[],
): Promise<ApiResult<Array<FileSystemItem>>> {
  if (!directoryPath || !Array.isArray(acceptedExtensions)) {
    return Promise.resolve(apiSuccess([]));
  }

  const extensionSet = new Set(
    acceptedExtensions
      .map((extension) => extension.toLowerCase())
      .filter(Boolean),
  );

  if (extensionSet.size === 0) {
    return Promise.resolve(apiSuccess([]));
  }

  try {
    const items_1 = await listDirectoryItems(directoryPath, extensionSet);
    return apiSuccess(items_1);
  } catch (error) {
    return apiFailure(error);
  }
}

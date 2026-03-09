import { apiFailure, apiSuccess } from '.';
import { dialog } from 'electron';
import { shell } from 'electron';
import fs from 'fs';
import path from 'path';

import type { ApiResult } from 'src/types/api';
import type { FileSystemItem } from 'src/types/file';

import { getExpectedRomNameFromVpxFile } from '../utils/vpxParsing';

const isAcceptedFilePath = (
  filePath: string,
  acceptedExtensions: Set<string>,
): boolean => {
  if (acceptedExtensions.size === 0) {
    return true;
  }

  const extension = path.extname(filePath).toLowerCase();
  return acceptedExtensions.has(extension);
};

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

export async function openDirectoryPicker(): Promise<ApiResult<string | null>> {
  try {
    const selection = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (selection.canceled || selection.filePaths.length === 0) {
      return apiSuccess(null);
    }

    return apiSuccess(selection.filePaths[0] || null);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function openFilePicker(
  acceptedExtensions: string[],
  acceptFolders: boolean = true,
): Promise<ApiResult<Array<FileSystemItem>>> {
  const extensionSet = new Set(
    (acceptedExtensions || [])
      .map((extension) => extension.toLowerCase())
      .filter(Boolean),
  );

  const properties: Array<'openFile' | 'openDirectory' | 'multiSelections'> = [
    'openFile',
    'multiSelections',
  ];

  if (acceptFolders) {
    properties.push('openDirectory');
  }

  const filters =
    extensionSet.size > 0
      ? [
          {
            name: 'Accepted Files',
            extensions: Array.from(extensionSet)
              .map((extension) => extension.replace(/^\./, ''))
              .filter(Boolean),
          },
        ]
      : undefined;

  try {
    const selection = await dialog.showOpenDialog({
      properties,
      filters,
    });

    if (selection.canceled || selection.filePaths.length === 0) {
      return apiSuccess([]);
    }

    const results: Array<FileSystemItem> = [];

    for (const selectedPath of selection.filePaths) {
      try {
        const stat = fs.statSync(selectedPath);

        if (stat.isDirectory()) {
          if (!acceptFolders) {
            continue;
          }

          const children = await listDirectoryItems(selectedPath, extensionSet);
          results.push(...children);
          continue;
        }

        if (!stat.isFile() || !isAcceptedFilePath(selectedPath, extensionSet)) {
          continue;
        }

        results.push({
          path: selectedPath,
          name: path.basename(selectedPath),
        });
      } catch {
        continue;
      }
    }

    const uniqueResults = results.filter(
      (item, index, allItems) =>
        allItems.findIndex((candidate) => candidate.path === item.path) ===
        index,
    );

    return apiSuccess(uniqueResults);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function openPath(filePath: string): Promise<ApiResult<null>> {
  try {
    if (!filePath) {
      return apiFailure(new Error('Path is required'));
    }

    const shellError = await shell.openPath(filePath);

    if (shellError) {
      return apiFailure(new Error(shellError));
    }

    return apiSuccess(null);
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

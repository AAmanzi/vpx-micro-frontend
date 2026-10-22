import fs from 'fs';
import os from 'os';
import path from 'path';

import { normalizePath } from 'src/utils';

export const resolveUserPath = (inputPath: string): string => {
  const normalizedPath = inputPath.trim();

  if (/^~(?=$|[\\/])/.test(normalizedPath)) {
    return normalizePath(path.join(os.homedir(), normalizedPath.slice(1)));
  }

  return normalizePath(normalizedPath);
};

export const normalizePathForComparison = (value?: string): string =>
  (value || '').trim().toLowerCase().replace(/\\/g, '/');

export const getTableIniPath = (vpxFilePath: string): string => {
  const parsedPath = path.parse(resolveUserPath(vpxFilePath));
  return path.join(parsedPath.dir, `${parsedPath.name}.ini`);
};

export const getLibraryFilePathKey = (filePath: string): string => {
  if (!filePath.trim()) {
    throw new Error('Library file path is required');
  }

  let resolvedPath = path.resolve(resolveUserPath(filePath));

  try {
    resolvedPath = fs.realpathSync.native(resolvedPath);
    const identity = fs.statSync(resolvedPath, { bigint: true });
    if (identity.ino !== BigInt(0)) {
      return `file:${identity.dev}:${identity.ino}`;
    }
  } catch (error) {
    if (
      !error ||
      typeof error !== 'object' ||
      !('code' in error) ||
      (error.code !== 'ENOENT' && error.code !== 'ENOTDIR')
    ) {
      throw error;
    }
  }

  return process.platform === 'win32'
    ? resolvedPath.toLowerCase()
    : resolvedPath;
};

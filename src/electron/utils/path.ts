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

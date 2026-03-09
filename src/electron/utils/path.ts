import os from 'os';
import path from 'path';

export const resolveUserPath = (inputPath: string): string => {
  const normalizedPath = inputPath.trim();

  if (/^~(?=$|[\\/])/.test(normalizedPath)) {
    return path.join(os.homedir(), normalizedPath.slice(1));
  }

  return normalizedPath;
};

export const normalizePathForComparison = (value?: string): string =>
  (value || '').trim().toLowerCase().replace(/\\/g, '/');

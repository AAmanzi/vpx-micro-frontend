import fs from 'fs';
import os from 'os';
import path from 'path';

const resolveUserPath = (inputPath: string): string => {
  if (/^~(?=$|[\\/])/.test(inputPath)) {
    return path.join(os.homedir(), inputPath.slice(1));
  }

  return inputPath;
};

const ensureDestinationDirectory = (destinationPath: string): void => {
  const resolvedDestinationPath = resolveUserPath(destinationPath);
  const directoryPath = path.dirname(resolvedDestinationPath);

  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Destination directory does not exist: ${directoryPath}`);
  }

  const stat = fs.statSync(directoryPath);
  if (!stat.isDirectory()) {
    throw new Error(`Destination path is not a directory: ${directoryPath}`);
  }
};

const IGNORABLE_DIRECTORY_ENTRIES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
]);

export const copyFile = (sourcePath: string, destinationPath: string): void => {
  const resolvedSourcePath = resolveUserPath(sourcePath);
  const resolvedDestinationPath = resolveUserPath(destinationPath);

  if (!fs.existsSync(resolvedSourcePath)) {
    throw new Error(`Source file does not exist: ${resolvedSourcePath}`);
  }

  const stat = fs.statSync(resolvedSourcePath);
  if (!stat.isFile()) {
    throw new Error(`Source path is not a file: ${resolvedSourcePath}`);
  }

  ensureDestinationDirectory(destinationPath);
  fs.copyFileSync(resolvedSourcePath, resolvedDestinationPath);
};

export const moveFile = (sourcePath: string, destinationPath: string): void => {
  const resolvedSourcePath = resolveUserPath(sourcePath);
  const resolvedDestinationPath = resolveUserPath(destinationPath);

  ensureDestinationDirectory(destinationPath);

  try {
    fs.renameSync(resolvedSourcePath, resolvedDestinationPath);
  } catch (error: any) {
    if (error?.code !== 'EXDEV') {
      throw error;
    }

    fs.copyFileSync(resolvedSourcePath, resolvedDestinationPath);
    fs.unlinkSync(resolvedSourcePath);
  }
};

export const deleteFile = (sourcePath: string): void => {
  const resolvedSourcePath = resolveUserPath(sourcePath);

  try {
    const stat = fs.statSync(resolvedSourcePath);

    if (!stat.isFile()) {
      throw new Error(`Source path is not a file: ${resolvedSourcePath}`);
    }

    fs.unlinkSync(resolvedSourcePath);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return;
    }

    throw error;
  }
};

export const removeEmptyParentDirectories = (sourcePath: string): void => {
  let currentDirectory = path.dirname(resolveUserPath(sourcePath));
  const homeDirectory = path.resolve(os.homedir());

  while (true) {
    const resolvedCurrentDirectory = path.resolve(currentDirectory);
    const parentDirectory = path.dirname(resolvedCurrentDirectory);

    if (
      resolvedCurrentDirectory === parentDirectory ||
      resolvedCurrentDirectory === homeDirectory
    ) {
      return;
    }

    try {
      const stat = fs.statSync(resolvedCurrentDirectory);

      if (!stat.isDirectory()) {
        return;
      }

      const entries = fs.readdirSync(resolvedCurrentDirectory);
      const nonIgnorableEntries = entries.filter(
        (entry) => !IGNORABLE_DIRECTORY_ENTRIES.has(entry),
      );

      if (nonIgnorableEntries.length > 0) {
        return;
      }

      entries
        .filter((entry) => IGNORABLE_DIRECTORY_ENTRIES.has(entry))
        .forEach((entry) => {
          const entryPath = path.join(resolvedCurrentDirectory, entry);

          try {
            fs.unlinkSync(entryPath);
          } catch (error: any) {
            if (error?.code !== 'ENOENT') {
              throw error;
            }
          }
        });

      fs.rmdirSync(resolvedCurrentDirectory);
      currentDirectory = parentDirectory;
    } catch (error: any) {
      if (
        error?.code === 'ENOENT' ||
        error?.code === 'ENOTEMPTY' ||
        error?.code === 'EEXIST'
      ) {
        return;
      }

      throw error;
    }
  }
};

export const createDirectoryIfNotExists = (directoryPath: string): boolean => {
  const resolvedDirectoryPath = path.resolve(resolveUserPath(directoryPath));
  const parentDirectory = path.dirname(resolvedDirectoryPath);

  try {
    const directoryStat = fs.statSync(resolvedDirectoryPath);
    return directoryStat.isDirectory();
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      return false;
    }
  }

  try {
    const parentStat = fs.statSync(parentDirectory);

    if (!parentStat.isDirectory()) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    fs.mkdirSync(resolvedDirectoryPath);
    return true;
  } catch {
    return false;
  }
};

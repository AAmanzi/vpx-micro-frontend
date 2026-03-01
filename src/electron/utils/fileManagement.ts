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

export const copyFile = (sourcePath: string, destinationPath: string): void => {
  const resolvedSourcePath = resolveUserPath(sourcePath);
  const resolvedDestinationPath = resolveUserPath(destinationPath);

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

import { FileSystemItem } from 'src/types/file';

import { TableFile } from '../types';

export const isVpxFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.vpx');

export const isRomFile = (file: FileSystemItem): boolean =>
  file.name.toLowerCase().endsWith('.zip');

export const createTableFile = (file: FileSystemItem): TableFile => ({
  name: file.name.replace(/\.vpx$/i, '').trim(),
  filePath: file.path,
  fileName: file.name,
});

import { FileSystemItem } from 'src/types/file';
import { TableFile } from 'src/types/file';

import { ImportSelectionResult } from '../types';

const normalizeRomName = (value: string): string =>
  value
    .trim()
    .replace(/\.zip$/i, '')
    .toLowerCase();

export const applyExpectedRoms = (
  tables: Array<TableFile>,
  roms: Array<FileSystemItem>,
): Pick<ImportSelectionResult, 'tablesToImport' | 'unassignedRoms'> => {
  const tablesToImport = tables.map((table) => {
    if (table.rom || !table.expectedRomName) {
      return table;
    }

    const expectedRomName = normalizeRomName(table.expectedRomName);
    const matchedRom = roms.find(
      (rom) => normalizeRomName(rom.name) === expectedRomName,
    );

    if (!matchedRom) {
      return table;
    }

    return {
      ...table,
      rom: matchedRom,
    };
  });

  const assignedRomPaths = new Set(
    tablesToImport
      .map((table) => table.rom?.path)
      .filter((romPath): romPath is string => Boolean(romPath)),
  );

  return {
    tablesToImport,
    unassignedRoms: roms.filter((rom) => !assignedRomPaths.has(rom.path)),
  };
};

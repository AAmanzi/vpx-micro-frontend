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
): ImportSelectionResult => {
  const availableRoms = [...roms];

  const tablesToImport = tables.map((table) => {
    if (table.rom || !table.expectedRomName) {
      return table;
    }

    const expectedRomName = normalizeRomName(table.expectedRomName);
    const romIndex = availableRoms.findIndex(
      (rom) => normalizeRomName(rom.name) === expectedRomName,
    );

    if (romIndex === -1) {
      return table;
    }

    const [matchedRom] = availableRoms.splice(romIndex, 1);

    return {
      ...table,
      rom: matchedRom,
    };
  });

  return {
    tablesToImport,
    unassignedRoms: availableRoms,
  };
};

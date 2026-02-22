import { FileSystemItem } from 'src/types/file';

import { ImportSelectionResult, TableFile } from '../types';
import { isRomFile, isVpxFile } from './helpers';

export const applyPairedDropRule = (
  tables: Array<TableFile>,
  roms: Array<FileSystemItem>,
  incomingFiles: Array<FileSystemItem>,
): ImportSelectionResult => {
  if (incomingFiles.length !== 2) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const supportedFiles = incomingFiles.filter(
    (file) => isVpxFile(file) || isRomFile(file),
  );

  if (supportedFiles.length !== 2) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const droppedTable = supportedFiles.find(isVpxFile);
  const droppedRom = supportedFiles.find(isRomFile);

  if (!droppedTable || !droppedRom) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const matchingTableIndex = tables.findIndex(
    (table) => table.filePath === droppedTable.path,
  );
  const matchingRomIndex = roms.findIndex(
    (rom) => rom.path === droppedRom.path,
  );

  if (matchingTableIndex === -1 || matchingRomIndex === -1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const updatedTables = [...tables];
  updatedTables[matchingTableIndex] = {
    ...updatedTables[matchingTableIndex],
    rom: roms[matchingRomIndex],
  };

  const updatedRoms = roms.filter((_, index) => index !== matchingRomIndex);

  return {
    tablesToImport: updatedTables,
    unassignedRoms: updatedRoms,
  };
};

export const applySingleRomToLastTableRule = (
  tables: Array<TableFile>,
  roms: Array<FileSystemItem>,
  incomingFiles: Array<FileSystemItem>,
): ImportSelectionResult => {
  if (incomingFiles.length !== 1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const incomingRoms = incomingFiles.filter(isRomFile);

  if (incomingRoms.length !== 1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const droppedRom = incomingRoms[0];
  const matchingRomIndex = roms.findIndex(
    (rom) => rom.path === droppedRom.path,
  );

  if (matchingRomIndex === -1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const lastTableWithoutRom = [...tables].reverse().find((table) => !table.rom);

  if (!lastTableWithoutRom) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const targetTableIndex = tables.findIndex(
    (table) => table.filePath === lastTableWithoutRom.filePath,
  );

  const updatedTables = [...tables];
  updatedTables[targetTableIndex] = {
    ...updatedTables[targetTableIndex],
    rom: roms[matchingRomIndex],
  };

  const updatedRoms = roms.filter((_, index) => index !== matchingRomIndex);

  return {
    tablesToImport: updatedTables,
    unassignedRoms: updatedRoms,
  };
};

export const applySingleTableToLastRomRule = (
  tables: Array<TableFile>,
  roms: Array<FileSystemItem>,
  incomingFiles: Array<FileSystemItem>,
): ImportSelectionResult => {
  if (incomingFiles.length !== 1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const incomingTables = incomingFiles.filter(isVpxFile);

  if (incomingTables.length !== 1 || roms.length === 0) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const droppedTable = incomingTables[0];
  const matchingTableIndex = tables.findIndex(
    (table) => table.filePath === droppedTable.path,
  );

  if (matchingTableIndex === -1) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const targetTable = tables[matchingTableIndex];

  if (targetTable.rom) {
    return {
      tablesToImport: tables,
      unassignedRoms: roms,
    };
  }

  const lastRom = roms[roms.length - 1];

  const updatedTables = [...tables];
  updatedTables[matchingTableIndex] = {
    ...updatedTables[matchingTableIndex],
    rom: lastRom,
  };

  const updatedRoms = roms.slice(0, -1);

  return {
    tablesToImport: updatedTables,
    unassignedRoms: updatedRoms,
  };
};

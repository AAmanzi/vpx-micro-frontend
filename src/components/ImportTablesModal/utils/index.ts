import { FileSystemItem } from 'src/types/file';

import { ImportSelectionResult, TableFile } from '../types';
import { createTableFile, isRomFile, isVpxFile } from './helpers';
import {
  applyPairedDropRule,
  applySingleRomToLastTableRule,
  applySingleTableToLastRomRule,
} from './rules';

export const buildImportSelectionResult = ({
  currentTables,
  currentUnassignedRoms,
  incomingFiles,
}: {
  currentTables: Array<TableFile>;
  currentUnassignedRoms: Array<FileSystemItem>;
  incomingFiles: Array<FileSystemItem>;
}): ImportSelectionResult => {
  const knownTablePaths = new Set(currentTables.map((table) => table.filePath));
  const knownRomPaths = new Set([
    ...currentUnassignedRoms.map((rom) => rom.path),
    ...currentTables.map((table) => table.rom?.path).filter(Boolean),
  ]);

  const newTables = incomingFiles
    .filter(isVpxFile)
    .filter((file) => !knownTablePaths.has(file.path))
    .map(createTableFile);

  const newRoms = incomingFiles
    .filter(isRomFile)
    .filter((file) => !knownRomPaths.has(file.path));

  const nextTables = [...currentTables, ...newTables];
  const nextUnassignedRoms = [...currentUnassignedRoms, ...newRoms];

  const afterTwoFileRule = applyPairedDropRule(
    nextTables,
    nextUnassignedRoms,
    incomingFiles,
  );

  const afterSingleRomRule = applySingleRomToLastTableRule(
    afterTwoFileRule.tablesToImport,
    afterTwoFileRule.unassignedRoms,
    incomingFiles,
  );

  return applySingleTableToLastRomRule(
    afterSingleRomRule.tablesToImport,
    afterSingleRomRule.unassignedRoms,
    incomingFiles,
  );
};

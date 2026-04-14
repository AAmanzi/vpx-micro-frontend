import { apiSuccess } from 'src/electron/api';
import { ApiResult } from 'src/types/api';
import { FileSystemItem, TableFile } from 'src/types/file';
import { ScanResult, Table } from 'src/types/table';

export function scanVpxLibrary(): ApiResult<ScanResult> {
  // info:
  // - all roms are matched by file name
  // - all table files are matched by vpx file name

  // get all tables
  // get config paths

  // create set of existing table vpx files
  // create set of existing rom files

  // find tables with missing files (vpx and rom)
  //    these are tablesWithMissingFiles

  // save rom paths of each table that has a missing vpx file, but existing rom file
  //    remove those rompaths from existing rom files set

  // scan vpx roms directory for rom files
  // scan vpx tables directory for vpx files
  //    these are newTables

  // from scanned vpx tables filter out ones that have been added to newly scanned tables
  //    these are unmatchedRoms

  return apiSuccess({
    newTables: [],
    unmatchedRoms: [],
    tablesWithMissingFiles: [],
  });
}

export const scanNewRoms = (
  existingRoms: Array<string>,
  directoryPath: string,
): Array<FileSystemItem> => {
  // scan the provided directory for rom files (.zip) and return an array of FileSystemItem objects representing the found roms
  // filter out ones that exist already

  return [];
};

export const scanNewTables = (
  existingTables: Array<string>,
  directoryPath: string,
  roms: Array<FileSystemItem>,
): Array<TableFile> => {
  // scan tables from tables directory
  // filter out ones that exist already

  // for each vpx file found, create a TableFile object
  // extract the expected rom name by calling getExpectedRomNameFromVpxFile
  // if the expected rom name matches a rom in the provided roms array, set the romFilePath property of the TableFile object

  return [];
};

export const findTablesWithMissingFiles = (
  tables: Array<Table>,
): Array<{
  table: Table;
  missingVpxFile: boolean;
  missingRomFile: boolean;
}> => {
  // for each table, check if the vpx file exists at the vpxFilePath
  // if not, add to result with missingVpxFile = true
  // if it exists, check if the rom file exists at the romFilePath
  // if not, add to result with missingRomFile = true

  // both flags can be true if both files are missing
  // if neither file is missing, the table should not be included in the result

  return [];
};

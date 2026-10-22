import { app } from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import type {
  IniBackup,
  IniBackupList,
  TableConfigDeletion,
} from 'src/types/iniBackup';

import * as tablesDb from '../database/tables';
import {
  getTableIniPath,
  normalizePathForComparison,
  resolveUserPath,
} from '../utils/path';

type StoredIniBackup = IniBackup & { lastSwappedAt?: number };

interface IniBackupStore {
  backups: Record<string, Array<StoredIniBackup>>;
  activeNames: Record<string, string | null>;
  activeSavedAt: Record<string, number>;
}

const store = new Store<IniBackupStore>({
  name: 'ini-backups',
  defaults: {
    backups: {},
    activeNames: {},
    activeSavedAt: {},
  },
});

const getBackupPath = (backupId: string): string =>
  path.join(app.getPath('userData'), 'ini-backups', `${backupId}.ini`);

const isFileAvailable = (filePath: string): boolean => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error.code === 'ENOENT' || error.code === 'ENOTDIR')
    ) {
      return false;
    }

    throw error;
  }
};

const getStoredBackups = (tableId: string): Array<IniBackup> =>
  (store.get('backups')[tableId] || []).map(({ lastSwappedAt, ...backup }) => ({
    ...backup,
    createdAt: backup.createdAt,
  }));

const saveStoredBackups = (
  tableId: string,
  backups: Array<StoredIniBackup>,
  activeNames = store.get('activeNames'),
  activeSavedAt = store.get('activeSavedAt'),
): void => {
  store.set({
    backups: {
      ...store.get('backups'),
      [tableId]: backups,
    },
    activeNames,
    activeSavedAt,
  });
};

const getTable = (tableId: string) => {
  const table = tablesDb.getResolved(tableId);

  if (!table) {
    throw new Error(`Table not found: ${tableId}`);
  }

  return table;
};

export const getTableConfigDeletion = (
  tableId: string,
): TableConfigDeletion => {
  const table = getTable(tableId);
  const iniPath = getTableIniPath(table.vpxFilePath);
  return {
    backups: getIniBackups(tableId).backups,
    activeIniPath: isFileAvailable(iniPath) ? iniPath : undefined,
    isActiveIniShared: tablesDb.getAll().some((item) => {
      if (item.id === tableId) return false;
      const other = getTable(item.id);
      return (
        normalizePathForComparison(getTableIniPath(other.vpxFilePath)) ===
        normalizePathForComparison(iniPath)
      );
    }),
  };
};

export const deleteTableConfigs = (
  tableId: string,
  deleteActiveConfig: boolean,
  removeTable: () => void,
): Array<string> => {
  const details = getTableConfigDeletion(tableId);
  const previousState = store.store;
  const files = details.backups
    .filter((backup) => backup.isAvailable)
    .map((backup) => getBackupPath(backup.id));
  if (
    deleteActiveConfig &&
    details.activeIniPath &&
    !details.isActiveIniShared
  ) {
    files.push(details.activeIniPath);
  }
  const backups = { ...previousState.backups };
  const activeNames = { ...previousState.activeNames };
  const activeSavedAt = { ...previousState.activeSavedAt };
  delete backups[tableId];
  delete activeNames[tableId];
  delete activeSavedAt[tableId];
  return deleteConfigFiles(
    files,
    { backups, activeNames, activeSavedAt },
    removeTable,
  );
};

export const clearLibraryConfigs = (
  clearLibrary: () => void,
): Array<string> => {
  const files = Object.values(store.get('backups'))
    .flat()
    .map((backup) => getBackupPath(backup.id))
    .filter(isFileAvailable);
  return deleteConfigFiles(
    [...new Set(files)],
    { backups: {}, activeNames: {}, activeSavedAt: {} },
    clearLibrary,
  );
};

const deleteConfigFiles = (
  files: Array<string>,
  nextState: IniBackupStore,
  removeLibraryEntries: () => void,
): Array<string> => {
  const previousState = store.store;
  const staged: Array<{ original: string; temporary: string }> = [];
  let metadataSaved = false;

  try {
    for (const original of files) {
      const temporary = `${original}.${uuidv4()}.delete`;
      fs.renameSync(original, temporary);
      staged.push({ original, temporary });
    }

    store.set(nextState);
    metadataSaved = true;
    removeLibraryEntries();
  } catch (error) {
    const failures: Array<string> = [];
    for (const file of staged.reverse()) {
      try {
        fs.renameSync(file.temporary, file.original);
      } catch (rollbackError) {
        console.error('Failed to restore table config:', rollbackError);
        failures.push(file.temporary);
      }
    }
    if (metadataSaved) {
      try {
        store.store = previousState;
      } catch (rollbackError) {
        console.error(
          'Failed to restore table config metadata:',
          rollbackError,
        );
        failures.push('config backup database');
      }
    }
    if (failures.length) {
      throw new Error(
        `Config cleanup failed and recovery needs attention: ${failures.join(', ')}`,
      );
    }
    throw error;
  }

  const remaining: Array<string> = [];
  for (const file of staged) {
    try {
      fs.unlinkSync(file.temporary);
    } catch (error) {
      console.error('Failed to remove staged table config:', error);
      remaining.push(file.temporary);
    }
  }
  return remaining;
};

const createBackup = (
  tableId: string,
  iniPath: string,
  name?: string,
): StoredIniBackup => {
  const backup: StoredIniBackup = {
    id: uuidv4(),
    name: name?.trim() || undefined,
    createdAt: Date.now(),
    originalIniPath: iniPath,
    isAvailable: true,
  };
  const backupDirectory = path.dirname(getBackupPath(backup.id));
  fs.mkdirSync(backupDirectory, { recursive: true });
  fs.copyFileSync(
    iniPath,
    getBackupPath(backup.id),
    fs.constants.COPYFILE_EXCL,
  );
  try {
    saveStoredBackups(tableId, [backup, ...getStoredBackups(tableId)]);
  } catch (error) {
    try {
      fs.unlinkSync(getBackupPath(backup.id));
    } catch (cleanupError) {
      console.error('Failed to clean up unsaved config backup:', cleanupError);
      throw new Error(
        `Backup creation failed. An unsaved copy remains at ${getBackupPath(backup.id)}.`,
      );
    }
    throw error;
  }

  return backup;
};

export const getIniBackups = (tableId: string): IniBackupList => {
  const table = getTable(tableId);
  const iniPath = getTableIniPath(table.vpxFilePath);
  const hasIni = isFileAvailable(iniPath);
  const backups = getStoredBackups(tableId)
    .map((backup) => ({
      ...backup,
      isAvailable: isFileAvailable(getBackupPath(backup.id)),
    }))
    .sort((left, right) => right.createdAt - left.createdAt);

  return {
    backups,
    hasIni,
    activeName: hasIni
      ? (store.get('activeNames')[tableId] ?? undefined)
      : undefined,
    activeSavedAt: hasIni
      ? (store.get('activeSavedAt')[tableId] ?? fs.statSync(iniPath).mtimeMs)
      : undefined,
  };
};

export const createIniBackup = (tableId: string, name?: string): IniBackup => {
  const table = getTable(tableId);
  const iniPath = getTableIniPath(table.vpxFilePath);

  if (!isFileAvailable(iniPath)) {
    throw new Error(
      "No table INI found. Configure and save the table's settings in VPX first.",
    );
  }

  return createBackup(tableId, iniPath, name);
};

export const restoreIniBackup = (
  tableId: string,
  backupId: string,
): boolean => {
  const table = getTable(tableId);
  const backups = getStoredBackups(tableId);
  const backup = backups.find((item) => item.id === backupId);

  if (!backup || !isFileAvailable(getBackupPath(backup.id))) {
    throw new Error('This INI backup is no longer available.');
  }

  const tablePath = resolveUserPath(table.vpxFilePath);

  if (!isFileAvailable(tablePath)) {
    throw new Error(
      `The table file could not be found at its current location: ${tablePath}`,
    );
  }

  const iniPath = getTableIniPath(tablePath);

  const backupPath = getBackupPath(backup.id);
  const hasCurrentIni = isFileAvailable(iniPath);
  const activeNames = store.get('activeNames');
  const activeSavedAt = store.get('activeSavedAt');
  const restoredActiveSavedAt = {
    ...activeSavedAt,
    [tableId]: backup.createdAt,
  };
  const restoredActiveNames = {
    ...activeNames,
    [tableId]: backup.name ?? null,
  };

  if (!hasCurrentIni) {
    fs.copyFileSync(backupPath, iniPath, fs.constants.COPYFILE_EXCL);
    let backupRemoved = false;
    try {
      fs.unlinkSync(backupPath);
      backupRemoved = true;
      saveStoredBackups(
        tableId,
        backups
          .filter((item) => item.id !== backupId)
          .map((item) => ({ ...item, isPreviousActive: false })),
        restoredActiveNames,
        restoredActiveSavedAt,
      );
    } catch (error) {
      if (backupRemoved) {
        fs.copyFileSync(iniPath, backupPath, fs.constants.COPYFILE_EXCL);
      }
      fs.unlinkSync(iniPath);
      throw error;
    }
    return false;
  }

  const currentIni = fs.readFileSync(iniPath);
  const currentSavedAt = activeSavedAt[tableId] ?? fs.statSync(iniPath).mtimeMs;
  const selectedIni = fs.readFileSync(backupPath);
  const swapId = uuidv4();
  const stagedIniPath = `${iniPath}.${swapId}.tmp`;
  const stagedBackupPath = `${backupPath}.${swapId}.tmp`;
  let preserveRecoveryFiles = false;
  let backupReplaced = false;
  let metadataAttempted = false;

  try {
    fs.writeFileSync(stagedIniPath, selectedIni, { flag: 'wx' });
    fs.writeFileSync(stagedBackupPath, currentIni, { flag: 'wx' });
    fs.renameSync(stagedIniPath, iniPath);

    try {
      fs.renameSync(stagedBackupPath, backupPath);
      backupReplaced = true;
      metadataAttempted = true;
      saveStoredBackups(
        tableId,
        backups.map((item) => ({
          ...item,
          name:
            item.id === backupId
              ? (activeNames[tableId] ?? undefined)
              : item.name,
          isPreviousActive: item.id === backupId,
          createdAt: item.id === backupId ? currentSavedAt : item.createdAt,
        })),
        restoredActiveNames,
        restoredActiveSavedAt,
      );
    } catch (error) {
      try {
        if (backupReplaced) {
          fs.writeFileSync(stagedBackupPath, currentIni, { flag: 'wx' });
          fs.writeFileSync(backupPath, selectedIni);
        }
        fs.writeFileSync(stagedIniPath, currentIni, { flag: 'wx' });
        fs.renameSync(stagedIniPath, iniPath);
        if (metadataAttempted) {
          saveStoredBackups(tableId, backups, activeNames, activeSavedAt);
        }
      } catch (rollbackError) {
        preserveRecoveryFiles = true;
        console.error('INI swap rollback failed:', rollbackError);
        throw new Error(
          `INI swap failed and the original settings could not be restored. Your previous INI is preserved at ${stagedBackupPath}.`,
        );
      }

      throw error;
    }
  } finally {
    // Keep the previous INI recoverable if rollback did not succeed.
    for (const temporaryPath of [stagedIniPath, stagedBackupPath]) {
      if (preserveRecoveryFiles) {
        continue;
      }

      try {
        fs.rmSync(temporaryPath, { force: true });
      } catch (error) {
        console.error(
          `Failed to remove INI swap file ${temporaryPath}:`,
          error,
        );
      }
    }
  }

  return true;
};

export const renameCurrentIni = (tableId: string, name: string): void => {
  const iniPath = getTableIniPath(getTable(tableId).vpxFilePath);
  if (!isFileAvailable(iniPath)) {
    throw new Error('No current INI found.');
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('INI name cannot be empty.');
  }
  saveStoredBackups(
    tableId,
    getStoredBackups(tableId),
    { ...store.get('activeNames'), [tableId]: trimmedName },
    {
      ...store.get('activeSavedAt'),
      [tableId]:
        store.get('activeSavedAt')[tableId] ?? fs.statSync(iniPath).mtimeMs,
    },
  );
};

export const deleteCurrentIni = (tableId: string): void => {
  const iniPath = getTableIniPath(getTable(tableId).vpxFilePath);
  const contents = fs.readFileSync(iniPath);
  fs.unlinkSync(iniPath);
  const activeNames = { ...store.get('activeNames') };
  const activeSavedAt = { ...store.get('activeSavedAt') };
  delete activeNames[tableId];
  delete activeSavedAt[tableId];
  try {
    saveStoredBackups(
      tableId,
      getStoredBackups(tableId).map((item) => ({
        ...item,
        isPreviousActive: false,
      })),
      activeNames,
      activeSavedAt,
    );
  } catch (error) {
    fs.writeFileSync(iniPath, contents, { flag: 'wx' });
    throw error;
  }
};

export const renameIniBackup = (
  tableId: string,
  backupId: string,
  name: string,
): IniBackup => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Backup name cannot be empty.');
  }

  const backups = getStoredBackups(tableId);
  const backup = backups.find((item) => item.id === backupId);

  if (!backup) {
    throw new Error('INI backup not found.');
  }

  const updatedBackup = { ...backup, name: trimmedName };
  saveStoredBackups(
    tableId,
    backups.map((item) => (item.id === backupId ? updatedBackup : item)),
  );

  return {
    ...updatedBackup,
    isAvailable: isFileAvailable(getBackupPath(updatedBackup.id)),
  };
};

export const deleteIniBackup = (tableId: string, backupId: string): void => {
  const backups = getStoredBackups(tableId);
  const backup = backups.find((item) => item.id === backupId);

  if (!backup) {
    throw new Error('INI backup not found.');
  }

  const backupPath = getBackupPath(backup.id);
  const stagedPath = `${backupPath}.${uuidv4()}.delete`;
  const hasFile = isFileAvailable(backupPath);
  if (hasFile) fs.renameSync(backupPath, stagedPath);
  let metadataSaved = false;
  try {
    saveStoredBackups(
      tableId,
      backups.filter((item) => item.id !== backupId),
    );
    metadataSaved = true;
    if (hasFile) fs.unlinkSync(stagedPath);
  } catch (error) {
    try {
      if (hasFile) fs.renameSync(stagedPath, backupPath);
      if (metadataSaved) saveStoredBackups(tableId, backups);
    } catch (rollbackError) {
      console.error('Config backup deletion rollback failed:', rollbackError);
      throw new Error(
        `Backup deletion failed and could not be fully rolled back. Check ${backupPath} and ${stagedPath} for the preserved config.`,
      );
    }
    throw error;
  }
};

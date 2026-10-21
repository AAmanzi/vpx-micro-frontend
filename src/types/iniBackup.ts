export interface IniBackup {
  id: string;
  name?: string;
  createdAt: number;
  isPreviousActive?: boolean;
  originalIniPath: string;
  isAvailable: boolean;
}

export interface IniBackupList {
  backups: Array<IniBackup>;
  hasIni: boolean;
  activeName?: string;
  activeSavedAt?: number;
}

export interface TableConfigDeletion {
  backups: Array<IniBackup>;
  activeIniPath?: string;
  isActiveIniShared: boolean;
}

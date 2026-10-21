import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Button, { Size as ButtonSize } from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useToastContext } from 'src/providers/toast';
import type { IniBackup, IniBackupList } from 'src/types/iniBackup';
import { displayDateTime } from 'src/utils';

import style from './ConfigBackupsPanel.module.scss';
import DeleteConfigBackupModal from './DeleteConfigBackupModal';
import ManageConfigBackupsModal from './ManageConfigBackupsModal';

interface Props {
  id: string;
  name: string;
  onBack: () => void;
}

const ConfigBackupsPanel: FunctionComponent<Props> = ({ id, name, onBack }) => {
  const { showErrorToast, showSuccessToast } = useToastContext();
  const showErrorToastRef = useRef(showErrorToast);
  showErrorToastRef.current = showErrorToast;
  const [backupList, setBackupList] = useState<IniBackupList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<IniBackup | null>(null);
  const [isDeletingCurrent, setIsDeletingCurrent] = useState(false);

  const closeDeleteModal = useCallback(() => {
    if (!isBusy) {
      setBackupToDelete(null);
      setIsDeletingCurrent(false);
    }
  }, [isBusy]);

  const closeManageModal = useCallback(() => {
    if (!backupToDelete && !isDeletingCurrent && !isBusy) {
      setIsManageOpen(false);
    }
  }, [backupToDelete, isDeletingCurrent, isBusy]);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await api.getIniBackups(id);

      if (!result.success) {
        showErrorToastRef.current(
          result.error.message || 'Failed to load config backups',
        );

        return;
      }

      setBackupList(result.data);
    } catch {
      showErrorToastRef.current('Failed to load config backups');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async (nameToSave?: string): Promise<boolean> => {
    setIsBusy(true);

    try {
      const result = await api.createIniBackup(id, nameToSave);

      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to create config backup',
        );

        return false;
      }

      showSuccessToast('config backup created');
      await refresh();
      return true;
    } catch {
      showErrorToast('Failed to create config backup');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleRestore = async (backup: IniBackup) => {
    if (!backup.isAvailable) {
      showErrorToast('This config backup is no longer available');

      return;
    }

    setIsBusy(true);

    try {
      const result = await api.restoreIniBackup(id, backup.id);

      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to restore config backup',
        );
        await refresh();

        return;
      }

      showSuccessToast(
        result.data
          ? 'Config swapped. Your previous settings are now in the selected backup.'
          : 'Config loaded. The backup is now active and was removed from the backup list.',
      );
      await refresh();
    } catch {
      showErrorToast('Failed to restore config backup');
      await refresh();
    } finally {
      setIsBusy(false);
    }
  };

  const handleRename = async (
    backupId: string,
    backupName: string,
  ): Promise<boolean> => {
    setIsBusy(true);

    try {
      const result = await api.renameIniBackup(id, backupId, backupName);

      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to rename config backup',
        );

        return false;
      }

      showSuccessToast('config backup renamed');
      await refresh();
      return true;
    } catch {
      showErrorToast('Failed to rename config backup');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (backup: IniBackup) => {
    setIsBusy(true);

    try {
      const result = await api.deleteIniBackup(id, backup.id);

      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to delete config backup',
        );

        return;
      }

      setBackupToDelete(null);
      showSuccessToast('config backup deleted');
      await refresh();
    } catch {
      showErrorToast('Failed to delete config backup');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRenameCurrent = async (currentName: string): Promise<boolean> => {
    setIsBusy(true);
    try {
      const result = await api.renameCurrentIni(id, currentName);
      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to rename current config',
        );
        return false;
      }
      showSuccessToast('Current config renamed');
      await refresh();
      return true;
    } catch {
      showErrorToast('Failed to rename current config');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteCurrent = async () => {
    setIsBusy(true);
    try {
      const result = await api.deleteCurrentIni(id);
      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to delete current config',
        );
        return;
      }
      setIsDeletingCurrent(false);
      showSuccessToast('Current config deleted');
      await refresh();
    } catch {
      showErrorToast('Failed to delete current config');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.panelHeader}>
        <button
          type='button'
          className={style.backButton}
          aria-label='Back to table actions'
          onClick={onBack}>
          <Icon icon='chevron-right' className={style.backIcon} />
        </button>
        <div className={style.heading}>
          <h3 className={style.title}>Config Backups</h3>
          <span className={style.tableName}>
            {(backupList?.backups.length ?? 0) +
              Number(backupList?.hasIni ?? false)}{' '}
            saved configurations
          </span>
        </div>
        <div className={style.createButton}>
          <Button
            size={ButtonSize.small}
            label='Create'
            icon='plus'
            disabled={isBusy || isLoading || !backupList?.hasIni}
            onClick={() => void handleCreate()}
          />
        </div>
      </div>

      <p className={style.panelDescription}>
        Save and restore table settings stored in .ini files.
      </p>

      {!isLoading &&
        backupList?.hasIni &&
        backupList.activeSavedAt !== undefined && (
          <div className={style.currentIni}>
            <span className={style.backupIcon}>
              <Icon icon='file-code' width={16} height={16} />
            </span>
            <div className={style.backupDetails}>
              <div className={style.currentHeading}>
                <span className={style.backupName}>
                  {backupList.activeName ||
                    displayDateTime(backupList.activeSavedAt)}
                </span>
                <span className={style.activeTag}>Active</span>
              </div>
              <span className={style.timestamp}>
                {displayDateTime(backupList.activeSavedAt)}
              </span>
            </div>
          </div>
        )}

      {!isLoading && backupList && !backupList.hasIni && (
        <p className={style.missingIni}>
          No current config. Load a backup below, or configure and save the
          table&apos;s settings in VPX.
        </p>
      )}

      {isLoading ? (
        <p className={style.emptyState}>Loading backups...</p>
      ) : !backupList ? (
        <p className={style.emptyState}>Backups could not be loaded.</p>
      ) : backupList.backups.length === 0 && backupList.hasIni ? (
        <div className={style.emptyState}>
          <h4>Nothing saved yet</h4>
          <p>Create your first backup before tuning the table.</p>
        </div>
      ) : backupList.backups.length === 0 ? null : (
        <ul className={style.backupList}>
          {backupList.backups.slice(0, 5).map((backup) => (
            <li key={backup.id} className={style.recentBackup}>
              <span className={style.backupIcon}>
                <Icon icon='file-code' width={16} height={16} />
              </span>
              <div className={style.backupDetails}>
                <span className={style.backupName}>
                  {backup.name || displayDateTime(backup.createdAt)}
                </span>
                <span className={style.timestamp}>
                  {displayDateTime(backup.createdAt)}
                </span>
                {!backup.isAvailable && (
                  <span className={style.unavailable}>Backup file missing</span>
                )}
              </div>
              <button
                type='button'
                className={style.restoreIconButton}
                aria-label={`${backupList.hasIni ? 'Swap' : 'Load'} ${backup.name || displayDateTime(backup.createdAt)}`}
                disabled={isBusy || !backup.isAvailable}
                title={backupList.hasIni ? 'Swap' : 'Load backup'}
                onClick={() => void handleRestore(backup)}>
                <Icon
                  icon={backupList.hasIni ? 'reload' : 'play'}
                  width={18}
                  height={18}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type='button'
        className={style.manageLink}
        disabled={isLoading}
        onClick={() => setIsManageOpen(true)}>
        <span>Manage all backups</span>
        <Icon icon='chevron-right' width={16} height={16} />
      </button>

      {isManageOpen && (
        <ManageConfigBackupsModal
          name={name}
          backupList={backupList}
          isLoading={isLoading}
          isBusy={isBusy}
          onClose={closeManageModal}
          onCreate={handleCreate}
          onRename={handleRename}
          onRenameCurrent={handleRenameCurrent}
          onDeleteCurrent={() => setIsDeletingCurrent(true)}
          onRestore={handleRestore}
          onDelete={setBackupToDelete}
        />
      )}
      {backupToDelete && (
        <DeleteConfigBackupModal
          title={
            backupToDelete.name || displayDateTime(backupToDelete.createdAt)
          }
          isBusy={isBusy}
          onClose={closeDeleteModal}
          onDelete={() => handleDelete(backupToDelete)}
        />
      )}
      {isDeletingCurrent && (
        <DeleteConfigBackupModal
          title={
            backupList?.activeName ||
            (backupList?.activeSavedAt !== undefined
              ? displayDateTime(backupList.activeSavedAt)
              : 'Current config')
          }
          isCurrent
          isBusy={isBusy}
          onClose={closeDeleteModal}
          onDelete={handleDeleteCurrent}
        />
      )}
    </div>
  );
};

export default ConfigBackupsPanel;

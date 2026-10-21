import { FormEvent, FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import type { IniBackup, IniBackupList } from 'src/types/iniBackup';
import { displayDateTime } from 'src/utils';

import style from './ConfigBackupsPanel.module.scss';

interface Props {
  name: string;
  backupList: IniBackupList | null;
  isLoading: boolean;
  isBusy: boolean;
  onClose: () => void;
  onCreate: (name?: string) => Promise<boolean>;
  onRename: (backupId: string, name: string) => Promise<boolean>;
  onRenameCurrent: (name: string) => Promise<boolean>;
  onDeleteCurrent: () => void;
  onRestore: (backup: IniBackup) => Promise<void>;
  onDelete: (backup: IniBackup) => void;
}

const ManageConfigBackupsModal: FunctionComponent<Props> = ({
  name,
  backupList,
  isLoading,
  isBusy,
  onClose,
  onCreate,
  onRename,
  onRenameCurrent,
  onDeleteCurrent,
  onRestore,
  onDelete,
}) => {
  const [backupName, setBackupName] = useState('');
  const [editingBackupId, setEditingBackupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [currentName, setCurrentName] = useState('');

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (await onCreate(backupName)) {
      setBackupName('');
    }
  };

  const handleRename = async (backupId: string) => {
    if (await onRename(backupId, editingName)) {
      setEditingBackupId(null);
      setEditingName('');
    }
  };

  return (
    <Modal
      title='Config Backups'
      titleClassName={style.modalTitle}
      description={`${name} · Table settings (.ini files)`}
      modalClassName={style.manageModal}
      headerClassName={style.modalHeader}
      onExitClick={onClose}
      size={ModalSize.medium}>
      <div className={style.manageContent}>
        <form className={style.createForm} onSubmit={handleCreate}>
          <div className={style.createInput}>
            <Input
              size={InputSize.small}
              value={backupName}
              onChange={setBackupName}
              placeholder='Optional backup name'
            />
          </div>
          <div className={style.createButton}>
            <Button
              size={ButtonSize.small}
              label='Create backup'
              icon='plus'
              disabled={isBusy || isLoading || !backupList?.hasIni}
              isSubmit
            />
          </div>
        </form>

        {!isLoading &&
          backupList?.hasIni &&
          backupList.activeSavedAt !== undefined && (
            <div className={style.currentIni}>
              <span className={style.backupIcon}>
                <Icon icon='file-code' width={16} height={16} />
              </span>
              {isEditingCurrent ? (
                <form
                  className={style.currentRenameForm}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (await onRenameCurrent(currentName))
                      setIsEditingCurrent(false);
                  }}>
                  <Input
                    size={InputSize.small}
                    value={currentName}
                    onChange={setCurrentName}
                    autoFocus
                    placeholder='Configuration name'
                  />
                  <Button
                    size={ButtonSize.small}
                    label='Save'
                    disabled={isBusy || !currentName.trim()}
                    isSubmit
                  />
                  <Button
                    size={ButtonSize.small}
                    type={ButtonType.transparent}
                    label='Cancel'
                    disabled={isBusy}
                    onClick={() => setIsEditingCurrent(false)}
                  />
                </form>
              ) : (
                <>
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
                  <div className={style.manageActions}>
                    <button
                      type='button'
                      aria-label='Rename current config'
                      title='Rename current config (display name only)'
                      disabled={isBusy}
                      onClick={() => {
                        setCurrentName(backupList.activeName || '');
                        setIsEditingCurrent(true);
                      }}>
                      <Icon icon='edit' width={18} height={18} />
                    </button>
                    <button
                      type='button'
                      aria-label='Delete current config'
                      title='Delete current config'
                      disabled={isBusy}
                      onClick={onDeleteCurrent}>
                      <Icon icon='trash' width={18} height={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        <p className={style.swapHelp}>
          {backupList?.hasIni
            ? 'Restoring swaps settings with the selected backup. Original timestamps and custom names follow their settings, including when swapped back.'
            : 'Loading moves a backup into the current config and removes it from the backup list. Its name and original timestamp are preserved.'}
        </p>

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
          <div className={style.modalEmptyState}>
            <span className={style.emptyIcon}>
              <Icon icon='save' width={28} height={28} />
            </span>
            <h3>No backups yet</h3>
            <p>Create one before experimenting with POV or camera settings.</p>
          </div>
        ) : backupList.backups.length === 0 ? null : (
          <ul className={style.manageList}>
            {backupList.backups.map((backup) => (
              <li key={backup.id} className={style.backup}>
                {editingBackupId === backup.id ? (
                  <div className={style.renameForm}>
                    <span className={style.backupIcon}>
                      <Icon icon='file-code' width={16} height={16} />
                    </span>
                    <Input
                      size={InputSize.small}
                      value={editingName}
                      onChange={setEditingName}
                      autoFocus
                      placeholder='Backup name'
                    />
                    <Button
                      size={ButtonSize.small}
                      label='Save'
                      disabled={isBusy || !editingName.trim()}
                      onClick={() => void handleRename(backup.id)}
                    />
                    <Button
                      size={ButtonSize.small}
                      type={ButtonType.transparent}
                      label='Cancel'
                      disabled={isBusy}
                      onClick={() => {
                        setEditingBackupId(null);
                        setEditingName('');
                      }}
                    />
                  </div>
                ) : (
                  <div className={style.backupRow}>
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
                        <span className={style.unavailable}>
                          Backup file missing
                        </span>
                      )}
                    </div>
                    <div className={style.backupActions}>
                      <button
                        type='button'
                        className={style.restoreButton}
                        disabled={isBusy || !backup.isAvailable}
                        onClick={() => void onRestore(backup)}>
                        <Icon
                          icon={backupList.hasIni ? 'reload' : 'play'}
                          width={18}
                          height={18}
                        />
                        <span>{backupList.hasIni ? 'Swap' : 'Load'}</span>
                      </button>
                      <div className={style.manageActions}>
                        <button
                          type='button'
                          aria-label='Rename backup'
                          title='Rename backup'
                          disabled={isBusy}
                          onClick={() => {
                            setEditingBackupId(backup.id);
                            setEditingName(backup.name || '');
                          }}>
                          <Icon icon='edit' width={18} height={18} />
                        </button>
                        <button
                          type='button'
                          aria-label='Delete backup'
                          title='Delete backup'
                          disabled={isBusy}
                          onClick={() => onDelete(backup)}>
                          <Icon icon='trash' width={18} height={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default ManageConfigBackupsModal;

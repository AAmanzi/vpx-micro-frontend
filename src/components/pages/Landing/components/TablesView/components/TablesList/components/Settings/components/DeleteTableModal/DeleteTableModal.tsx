import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Checkbox from 'src/components/Checkbox';
import Icon from 'src/components/Icon';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import type { TableConfigDeletion } from 'src/types/iniBackup';
import { displayDateTime, normalizePathForComparison } from 'src/utils';

import style from './DeleteTableModal.module.scss';

interface Props {
  id: string;
  romFile?: string;
  vpxFile: string;
  close: () => void;
}

const DeleteTableModal: FunctionComponent<Props> = ({
  id,
  romFile,
  vpxFile,
  close,
}) => {
  const { showErrorToast } = useToastContext();
  const { tables } = useTablesContext();
  const [configDetails, setConfigDetails] =
    useState<TableConfigDeletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteActiveConfig, setDeleteActiveConfig] = useState(false);
  const showErrorRef = useRef(showErrorToast);
  showErrorRef.current = showErrorToast;

  const loadConfigDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getTableConfigDeletion(id);
      if (!result.success) {
        setConfigDetails(null);
        showErrorRef.current(
          result.error.message || 'Failed to load configs for deletion',
        );
        return;
      }
      setConfigDetails(result.data);
    } catch {
      setConfigDetails(null);
      showErrorRef.current('Failed to load configs for deletion');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadConfigDetails();
  }, [loadConfigDetails]);

  const handleClose = () => {
    if (!isDeleting) close();
  };

  const table = tables.find((item) => item.id === id);
  const romFilePath = table?.romFilePath;
  const isRomSharedWithOtherTables =
    !!romFilePath &&
    tables.some(
      (table) =>
        table.id !== id &&
        table.romFilePath &&
        normalizePathForComparison(table.romFilePath) ===
          normalizePathForComparison(romFilePath),
    );
  const willDeleteRom = !!romFile && !isRomSharedWithOtherTables;
  const isBackglassSharedWithOtherTables =
    !!table?.backglassFilePath &&
    tables.some(
      (item) =>
        item.id !== id &&
        item.backglassFilePath &&
        normalizePathForComparison(item.backglassFilePath) ===
          normalizePathForComparison(table.backglassFilePath),
    );
  const willDeleteBackglass =
    !!table?.backglassFile && !isBackglassSharedWithOtherTables;

  const handleDelete = async () => {
    if (isDeleting || isLoading || !configDetails) return;
    setIsDeleting(true);
    try {
      const result = await api.deleteTable(id, {
        deleteActiveConfig:
          deleteActiveConfig && !configDetails.isActiveIniShared,
      });
      if (!result.success) {
        showErrorToast(result.error.message || 'Failed to delete table');
        return;
      }
      if (result.warning) {
        showErrorToast(
          result.warning.message ||
            'Table deleted, but config cleanup was incomplete',
        );
      }
      close();
    } catch {
      showErrorToast('Failed to delete table');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      title='Delete Table'
      description='Are you sure you want to delete this table?'
      modalClassName={style.modal}
      headerClassName={style.header}
      onExitClick={handleClose}
      size={ModalSize.medium}>
      <div className={style.content}>
        <p className={style.text}>Files to be deleted</p>
        <ul className={style.filesList}>
          <li className={style.fileItem}>
            <Icon icon='file-code' width={16} height={16} />
            <span>{vpxFile}</span>
          </li>
          {willDeleteRom && (
            <li className={style.fileItem}>
              <Icon icon='package' width={16} height={16} />
              <span>{romFile}</span>
            </li>
          )}
          {willDeleteBackglass && table?.backglassFile && (
            <li className={style.fileItem}>
              <Icon icon='monitor' width={16} height={16} />
              <span>{table.backglassFile}</span>
            </li>
          )}
        </ul>
        <div className={style.configSection}>
          {isLoading ? (
            <p className={style.note}>Loading configs...</p>
          ) : !configDetails ? (
            <div>
              <p className={style.note}>
                Configs could not be loaded. Retry before deleting.
              </p>
              <Button
                size={ButtonSize.small}
                type={ButtonType.transparent}
                label='Retry'
                onClick={() => void loadConfigDetails()}
              />
            </div>
          ) : (
            <>
              {configDetails.backups.length ? (
                <details className={style.backupDetails}>
                  <summary className={style.fileItem}>
                    <Icon icon='archive' width={16} height={16} />
                    <span>
                      {configDetails.backups.length} config{' '}
                      {configDetails.backups.length === 1
                        ? 'backup'
                        : 'backups'}
                    </span>
                  </summary>
                  <ul className={style.backupList}>
                    {configDetails.backups.map((backup) => (
                      <li key={backup.id} className={style.backupItem}>
                        {backup.name
                          ? `${backup.name} · ${displayDateTime(backup.createdAt)}`
                          : displayDateTime(backup.createdAt)}
                        {!backup.isAvailable && (
                          <span className={style.note}>
                            {' '}
                            · File missing (record will be removed)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {configDetails.activeIniPath &&
                (configDetails.isActiveIniShared ? (
                  <p className={style.note}>
                    Active config is shared with another table and will be kept:{' '}
                    {configDetails.activeIniPath}
                  </p>
                ) : (
                  <div className={style.activeConfig}>
                    <label className={style.configOption}>
                      <Checkbox
                        checked={deleteActiveConfig}
                        onChange={() => {
                          if (!isDeleting)
                            setDeleteActiveConfig((value) => !value);
                        }}
                        color='red'
                      />
                      <span>Also delete active config (.ini)</span>
                    </label>
                    <p className={style.note}>
                      Your current table settings are kept by default.
                    </p>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
      <div className={style.footer}>
        <Button
          size={ButtonSize.small}
          type={ButtonType.transparent}
          label='Cancel'
          disabled={isDeleting}
          onClick={handleClose}
        />
        <Button
          size={ButtonSize.small}
          type={ButtonType.danger}
          label='Delete'
          loading={isDeleting}
          disabled={isLoading || !configDetails || isDeleting}
          onClick={handleDelete}
        />
      </div>
    </Modal>
  );
};

export default DeleteTableModal;

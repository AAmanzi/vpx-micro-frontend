import { FunctionComponent } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Modal, { Size as ModalSize } from 'src/components/Modal';

import style from './ConfigBackupsPanel.module.scss';

interface Props {
  title: string;
  isCurrent?: boolean;
  isBusy: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

const DeleteConfigBackupModal: FunctionComponent<Props> = ({
  title,
  isCurrent = false,
  isBusy,
  onClose,
  onDelete,
}) => (
  <Modal
    title={isCurrent ? 'Delete current config' : 'Delete config backup'}
    description={
      isCurrent
        ? 'Are you sure you want to delete the current table settings config?'
        : 'Are you sure you want to delete this backup?'
    }
    onExitClick={onClose}
    size={ModalSize.small}
    color='red'>
    <div className={style.deleteContent}>
      <p className={style.deleteBackupName}>{title}</p>
      <p>
        {isCurrent
          ? 'The current .ini file will be permanently deleted. Existing backups are not affected.'
          : 'This backup will be permanently deleted. This cannot be undone.'}
      </p>
    </div>
    <div className={style.deleteFooter}>
      <Button
        size={ButtonSize.small}
        type={ButtonType.transparent}
        label='Cancel'
        disabled={isBusy}
        onClick={onClose}
      />
      <Button
        size={ButtonSize.small}
        type={ButtonType.danger}
        label='Delete'
        loading={isBusy}
        onClick={() => void onDelete()}
      />
    </div>
  </Modal>
);

export default DeleteConfigBackupModal;

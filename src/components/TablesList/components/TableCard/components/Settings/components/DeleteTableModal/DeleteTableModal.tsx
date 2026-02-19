import { FunctionComponent } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Modal, { Size as ModalSize } from 'src/components/Modal';

import style from './DeleteTableModal.module.scss';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  vpxFile: string;
  close: () => void;
}

const DeleteTableModal: FunctionComponent<Props> = ({
  name,
  romFile,
  vpxFile,
  close,
}) => {
  const handleDelete = () => {
    // TODO: API
  };

  return (
    <Modal
      title='Delete Table'
      description='Are you sure you want to delete this table?'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.small}>
      <div className={style.content}>
        <p className={style.text}>Deleting {name} will remove these files:</p>
        <ul className={style.filesList}>
          <li className={style.fileItem}>{vpxFile}</li>
          {romFile && <li className={style.fileItem}>{romFile}</li>}
        </ul>
      </div>
      <div className={style.footer}>
        <Button
          size={ButtonSize.small}
          type={ButtonType.transparent}
          label='Cancel'
          onClick={close}
        />
        <Button
          size={ButtonSize.small}
          type={ButtonType.danger}
          label='Delete'
          onClick={handleDelete}
        />
      </div>
    </Modal>
  );
};

export default DeleteTableModal;

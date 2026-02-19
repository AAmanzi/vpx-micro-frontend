import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Input from 'src/components/Input';
import Modal, { Size as ModalSize } from 'src/components/Modal';

import style from './RenameTableModal.module.scss';

interface Props {
  id: string;
  name: string;
  close: () => void;
}

const RenameTableModal: FunctionComponent<Props> = ({
  id,
  name: nameFromProps,
  close,
}) => {
  const [name, setName] = useState(nameFromProps);

  const handleSave = () => {
    // TODO: API
  };

  return (
    <Modal
      title='Rename Table'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.small}>
      <div className={style.content}>
        <Input value={name} onChange={setName} />
      </div>
      <div className={style.footer}>
        <Button
          size={ButtonSize.small}
          type={ButtonType.transparent}
          label='Cancel'
          onClick={close}
        />
        <Button size={ButtonSize.small} label='Save' onClick={handleSave} />
      </div>
    </Modal>
  );
};

export default RenameTableModal;

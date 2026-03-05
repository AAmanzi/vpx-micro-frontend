import { FunctionComponent } from 'react';

import Modal from 'src/components/Modal';

interface Props {
  close: () => void;
}

const ExportTablesModal: FunctionComponent<Props> = ({ close }) => {
  return (
    <Modal title='ExportTablesModal' onExitClick={close}>
      <div></div>
    </Modal>
  );
};

export default ExportTablesModal;

import { FunctionComponent } from 'react';

import Modal from 'src/components/Modal';

interface Props {
  close: () => void;
}

const ScanLibraryModal: FunctionComponent<Props> = ({ close }) => {
  return (
    <Modal title='ScanLibraryModal' onExitClick={close}>
      <div></div>
    </Modal>
  );
};

export default ScanLibraryModal;

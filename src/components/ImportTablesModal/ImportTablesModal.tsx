import { FunctionComponent, useState } from 'react';

import FileUpload from 'src/components/FileUpload';
import { FileSystemItem } from 'src/components/FileUpload/types';
import Modal from 'src/components/Modal';

import style from './ImportTablesModal.module.scss';

interface Props {
  onClose: () => void;
}

const ImportTablesModal: FunctionComponent<Props> = ({ onClose }) => {
  const [filesToImport, setFilesToImport] = useState<FileSystemItem[]>([]);

  const handleFilesSelected = (files: FileSystemItem[]) => {
    setFilesToImport((prev) => [...prev, ...files]);
  };

  console.log(filesToImport);

  return (
    <Modal
      onExitClick={onClose}
      title='Import Tables & ROMs'
      description='Drag folders or individual .vpx and .zip files'>
      <div className={style.content}>
        <FileUpload
          label='Select Tables & ROMs'
          description='Drag and drop .vpx files, .zip ROMs, or folders here'
          acceptedExtensions={['.vpx', '.zip']}
          acceptFolders={true}
          onFilesSelected={handleFilesSelected}
        />
      </div>
    </Modal>
  );
};

export default ImportTablesModal;

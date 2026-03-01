import classNames from 'classnames';
import { FunctionComponent, use, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import { useTablesContext } from 'src/providers/tables';
import useClickOutside from 'src/utils/useClickOutside';

import style from './Settings.module.scss';
import DeleteTableModal from './components/DeleteTableModal';
import RenameTableModal from './components/RenameTableModal';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  vpxFile: string;
  close: () => void;
}

const Settings: FunctionComponent<Props> = ({
  id,
  name,
  romFile,
  vpxFile,
  close,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, close, { ignoreSelector: '#modal' });

  const { fetchTables } = useTablesContext();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    fetchTables();
    close();
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    fetchTables();
    close();
  };

  return (
    <div ref={ref} className={style.container}>
      <button
        onClick={() => setIsRenameModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='edit' className={style.icon} />
        </div>
        <span className={classNames('caption-medium-semibold', style.label)}>
          Rename Table
        </span>
      </button>
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className={classNames(style.button, style.danger)}>
        <div className={style.iconWrapper}>
          <Icon icon='trash' className={style.icon} />
        </div>
        <span className={classNames('caption-medium-semibold', style.label)}>
          Delete table
        </span>
      </button>
      {isRenameModalOpen && (
        <RenameTableModal id={id} name={name} close={closeRenameModal} />
      )}
      {isDeleteModalOpen && (
        <DeleteTableModal
          id={id}
          vpxFile={vpxFile}
          romFile={romFile}
          close={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default Settings;

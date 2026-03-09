import classNames from 'classnames';
import { FunctionComponent, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import { useTablesContext } from 'src/providers/tables';
import useClickOutside from 'src/utils/useClickOutside';

import style from './Settings.module.scss';
import DeleteTableModal from './components/DeleteTableModal';
import EditTableExecutableModal from './components/EditTableExecutableModal';
import EditTableRomModal from './components/EditTableRomModal/EditTableRomModal';
import RenameTableModal from './components/RenameTableModal';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  romFilePath?: string;
  vpxExecutablePath?: string;
  vpxFile: string;
  vpxFilePath: string;
  close: () => void;
}

const Settings: FunctionComponent<Props> = ({
  id,
  name,
  romFile,
  romFilePath,
  vpxExecutablePath,
  vpxFile,
  vpxFilePath,
  close,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, close, { ignoreSelector: '#modal' });

  const { fetchTables } = useTablesContext();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isEditTableRomModalOpen, setIsEditTableRomModalOpen] = useState(false);
  const [isEditExecutableModalOpen, setIsEditExecutableModalOpen] =
    useState(false);
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

  const closeEditTableRomModal = () => {
    setIsEditTableRomModalOpen(false);
    fetchTables();
    close();
  };

  const closeEditExecutableModal = () => {
    setIsEditExecutableModalOpen(false);
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
        <span className={classNames('body-sm-semibold', style.label)}>
          Rename Table
        </span>
      </button>
      <button
        onClick={() => setIsEditTableRomModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='package' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          Edit ROM
        </span>
      </button>
      <button
        onClick={() => setIsEditExecutableModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='play' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          VPX Executable
        </span>
      </button>
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className={classNames(style.button, style.danger)}>
        <div className={style.iconWrapper}>
          <Icon icon='trash' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          Delete table
        </span>
      </button>
      {isRenameModalOpen && (
        <RenameTableModal id={id} name={name} close={closeRenameModal} />
      )}
      {isEditTableRomModalOpen && (
        <EditTableRomModal
          id={id}
          vpxFilePath={vpxFilePath}
          currentRomName={romFile}
          currentRomPath={romFilePath}
          close={closeEditTableRomModal}
        />
      )}
      {isEditExecutableModalOpen && (
        <EditTableExecutableModal
          id={id}
          currentExecutablePath={vpxExecutablePath}
          close={closeEditExecutableModal}
        />
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

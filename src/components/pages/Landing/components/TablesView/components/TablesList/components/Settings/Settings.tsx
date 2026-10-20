import classNames from 'classnames';
import { FunctionComponent, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import type { ResolvedTable } from 'src/types/table';
import { getTableGradientVariant } from 'src/utils';
import useClickOutside from 'src/utils/useClickOutside';

import style from './Settings.module.scss';
import DeleteTableModal from './components/DeleteTableModal';
import EditTableBackglassModal from './components/EditTableBackglassModal';
import EditTableExecutableModal from './components/EditTableExecutableModal';
import EditTableImageModal from './components/EditTableImageModal/EditTableImageModal';
import EditTableRomModal from './components/EditTableRomModal/EditTableRomModal';
import RenameTableModal from './components/RenameTableModal';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  romFilePath?: string;
  imgUrl?: string;
  imagePreference?: ResolvedTable['imagePreference'];
  vpxExecutablePath?: string;
  launchFlags?: ResolvedTable['launchFlags'];
  isArchived?: boolean;
  vpxFile: string;
  vpxFilePath: string;
  close: () => void;
}

const Settings: FunctionComponent<Props> = ({
  id,
  name,
  romFile,
  romFilePath,
  imgUrl,
  imagePreference,
  vpxExecutablePath,
  launchFlags,
  isArchived,
  vpxFile,
  vpxFilePath,
  close,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, close, { ignoreSelector: '#modal' });

  const { fetchTables, tables } = useTablesContext();
  const { showErrorToast } = useToastContext();
  const table = tables.find((item) => item.id === id);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isEditBackglassModalOpen, setIsEditBackglassModalOpen] =
    useState(false);
  const [isEditTableRomModalOpen, setIsEditTableRomModalOpen] = useState(false);
  const [isEditTableImageModalOpen, setIsEditTableImageModalOpen] =
    useState(false);
  const [isEditExecutableModalOpen, setIsEditExecutableModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    fetchTables();
    close();
  };

  const closeEditBackglassModal = () => {
    setIsEditBackglassModalOpen(false);
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

  const closeEditTableImageModal = () => {
    setIsEditTableImageModalOpen(false);
    fetchTables();
    close();
  };

  const closeEditExecutableModal = () => {
    setIsEditExecutableModalOpen(false);
    fetchTables();
    close();
  };

  const handleToggleArchive = async () => {
    const { error } = await api.setTableArchived(id, !isArchived);

    if (error) {
      showErrorToast(error.message || 'Failed to update table archive state');

      return;
    }

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
        onClick={() => setIsEditBackglassModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='wallpaper' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          Edit Backglass
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
        onClick={() => setIsEditTableImageModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='folder' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          Table Image
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
      <button onClick={handleToggleArchive} className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='archive' className={style.icon} />
        </div>
        <span className={classNames('body-sm-semibold', style.label)}>
          {isArchived ? 'Unarchive table' : 'Archive table'}
        </span>
      </button>
      {isRenameModalOpen && (
        <RenameTableModal id={id} name={name} close={closeRenameModal} />
      )}
      {isEditBackglassModalOpen && (
        <EditTableBackglassModal
          id={id}
          currentBackglassName={table?.backglassFile}
          currentBackglassPath={table?.backglassFilePath}
          close={closeEditBackglassModal}
        />
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
      {isEditTableImageModalOpen && (
        <EditTableImageModal
          id={id}
          name={name}
          currentImgUrl={imgUrl}
          currentImagePreference={imagePreference}
          close={closeEditTableImageModal}
          gradientClassName={getTableGradientVariant({
            romFile,
            vpxFile,
            id,
          } as ResolvedTable)}
        />
      )}
      {isEditExecutableModalOpen && (
        <EditTableExecutableModal
          id={id}
          currentExecutablePath={vpxExecutablePath}
          currentLaunchFlags={launchFlags}
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

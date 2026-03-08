import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Icon from 'src/components/Icon';
import ScanLibraryModal from 'src/components/ScanLibraryModal';

import style from './DataSection.module.scss';
import ExportTablesModal from './components/ExportTablesModal';

const DataSection: FunctionComponent = () => {
  const [isScanLibraryModalOpen, setIsScanLibraryModalOpen] = useState(false);
  const [isExportTablesModalOpen, setIsExportTablesModalOpen] = useState(false);

  const openScanLibraryModal = () => {
    setIsScanLibraryModalOpen(true);
  };

  const closeScanLibraryModal = () => {
    setIsScanLibraryModalOpen(false);
  };

  const openExportTablesModal = () => {
    setIsExportTablesModalOpen(true);
  };

  const closeExportTablesModal = () => {
    setIsExportTablesModalOpen(false);
  };

  return (
    <>
      <div className={style.optionsWrapper}>
        <button
          onClick={openScanLibraryModal}
          type='button'
          className={classNames(style.option, style.purple)}>
          <div className={style.iconContainer}>
            <Icon
              className={style.icon}
              icon='scan-search'
              width={20}
              height={20}
            />
          </div>
          <div>
            <h3 className='primary-text-color body-md-semibold'>
              Scan VPX Library
            </h3>
            <p className='secondary-text-color body-xs-regular'>
              Discover your VPX tables and ROMs automatically by scanning your
              VPX directory.
            </p>
          </div>
          <div className={style.chevronWrapper}>
            <Icon
              className={style.chevron}
              icon='chevron-right'
              width={20}
              height={20}
            />
          </div>
        </button>
        <button
          onClick={openExportTablesModal}
          type='button'
          className={classNames(style.option, style.blue)}>
          <div className={style.iconContainer}>
            <Icon
              className={style.icon}
              icon='folder-export'
              width={20}
              height={20}
            />
          </div>
          <div>
            <h3 className='primary-text-color body-md-semibold'>
              Export Tables
            </h3>
            <p className='secondary-text-color body-xs-regular'>
              Create a bundle of tables and their ROMs to share or use on
              another VPX setup.
            </p>
          </div>
          <div className={style.chevronWrapper}>
            <Icon
              className={style.chevron}
              icon='chevron-right'
              width={20}
              height={20}
            />
          </div>
        </button>
      </div>
      {isScanLibraryModalOpen && (
        <ScanLibraryModal close={closeScanLibraryModal} />
      )}
      {isExportTablesModalOpen && (
        <ExportTablesModal close={closeExportTablesModal} />
      )}
    </>
  );
};

export default DataSection;

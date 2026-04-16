import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Button from 'src/components/Button';
import {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button/types';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import { getDefaultVpxExecutablePath } from 'src/utils';

import style from './Settings.module.scss';
import DataSection from './components/DataSection';
import FilePathsSection from './components/FilePathsSection';
import MaintenanceSection from './components/MaintenanceSection';

const Settings: FunctionComponent = () => {
  const { config } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const vpxRootPath = config?.vpxRootPath || '';
  const vpxExecutablePath =
    config?.vpxExecutablePath || getDefaultVpxExecutablePath(vpxRootPath);

  const handleOpenVpxFolder = async () => {
    const { error } = await api.openPath(vpxRootPath);
    if (error) showErrorToast(error.message || 'Failed to open folder');
  };

  const handleRunVpx = async () => {
    const { error } = await api.openPath(vpxExecutablePath);
    if (error) showErrorToast(error.message || 'Failed to launch VPX');
  };
  return (
    <>
      <div className={style.header}>
        <div className={style.headerIconWrapper}>
          <Icon
            className={style.headerIcon}
            icon='cog'
            width={28}
            height={28}
          />
        </div>
        <div className={style.headerActions}>
          <Button
            label='Open VPX folder'
            icon='folder'
            type={ButtonType.transparent}
            size={ButtonSize.small}
            onClick={handleOpenVpxFolder}
            disabled={!vpxRootPath}
          />
          <Button
            label='Run VPX'
            icon='play'
            type={ButtonType.transparent}
            size={ButtonSize.small}
            onClick={handleRunVpx}
            disabled={!vpxRootPath}
          />
        </div>
      </div>
      <div className={style.container}>
        <div className={style.titleWrapper}>
          <h1 className='primary-text-color heading-6-bold'>
            Application Settings
          </h1>
          <p className='secondary-text-color body-sm-regular'>
            Configure your Visual Pinball X environment
          </p>
        </div>
        <div className={classNames(style.section, style.filePathsSection)}>
          <div className={style.sectionHeader}>
            <Icon
              className={style.sectionIcon}
              icon='folder'
              width={20}
              height={20}
            />
            <h2 className='primary-text-color heading-4-bold'>File Paths</h2>
          </div>
          <div>
            <FilePathsSection />
          </div>
        </div>
        <div className={classNames(style.section, style.dataSection)}>
          <div className={style.sectionHeader}>
            <Icon
              className={style.sectionIcon}
              icon='database'
              width={20}
              height={20}
            />
            <h2 className='primary-text-color heading-4-bold'>
              Data Management
            </h2>
          </div>
          <div>
            <DataSection />
          </div>
        </div>
        <div className={classNames(style.section, style.maintenanceSection)}>
          <div className={style.sectionHeader}>
            <Icon
              className={style.sectionIcon}
              icon='shield-checkmark'
              width={20}
              height={20}
            />
            <h2 className='primary-text-color heading-4-bold'>Maintenance</h2>
          </div>
          <div>
            <MaintenanceSection />
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

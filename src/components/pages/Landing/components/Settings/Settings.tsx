import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';

import style from './Settings.module.scss';
import DataSection from './components/DataSection';
import FilePathsSection from './components/FilePathsSection';
import MaintenanceSection from './components/MaintenanceSection';

const Settings: FunctionComponent = () => {
  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.headerIconWrapper}>
            <Icon
              className='accent-primary-text-color'
              icon='cog'
              width={28}
              height={28}
            />
          </div>
          <div>
            <h1 className='primary-text-color title-h2-bold'>
              Application Settings
            </h1>
            <p className='secondary-text-color text-body-regular'>
              Configure your Visual Pinball X environment
            </p>
          </div>
        </div>
        <div className={classNames(style.section, style.filePathsSection)}>
          <div className={style.sectionHeader}>
            <Icon
              className={style.sectionIcon}
              icon='folder'
              width={20}
              height={20}
            />
            <h2 className='primary-text-color title-h4-bold'>File Paths</h2>
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
            <h2 className='primary-text-color title-h4-bold'>
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
            <h2 className='primary-text-color title-h4-bold'>Maintenance</h2>
          </div>
          <div>
            <MaintenanceSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

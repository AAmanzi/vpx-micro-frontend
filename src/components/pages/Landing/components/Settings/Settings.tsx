import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button from 'src/components/Button';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { getDefaultRomsDirectory, getDefaultTablesDirectory } from 'src/utils';

import style from './Settings.module.scss';
import LockedSetting from './components/LockedSetting';

const Settings: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();

  const [_vpxRootPath, setVpxRootPath] = useState('');
  const [_romsDirectory, setRomsDirectory] = useState('');
  const [_tablesDirectory, setTablesDirectory] = useState('');

  const vpxRootPath = _vpxRootPath || config?.vpxRootPath || '';
  const romsDirectory = _romsDirectory || config?.romsDirectory || '';
  const tablesDirectory = _tablesDirectory || config?.tablesDirectory || '';

  const defaultRomsDirectory = getDefaultRomsDirectory(vpxRootPath);
  const defaultTablesDirectory = getDefaultTablesDirectory(vpxRootPath);

  const handleUpdateVpxRootPath = async () => {
    // TODO: Response handling
    await api.updateVpxRootPath(vpxRootPath);
    fetchConfig();
  };

  // TODO: not good when resetting to default, treating defaults as unlocked
  const handleSaveRomsDirectory = async (newValue: string) => {
    setRomsDirectory(newValue);
    // TODO: Response handling
    await api.updateRomsDirectoryPath(newValue);
    fetchConfig();
  };

  const handleSaveTablesDirectory = async (newValue: string) => {
    setTablesDirectory(newValue);
    // TODO: Response handling
    await api.updateTablesDirectoryPath(newValue);
    fetchConfig();
  };

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
        <div className={style.section}>
          <div className={style.sectionHeader}>
            <Icon
              className='accent-primary-text-color'
              icon='folder'
              width={20}
              height={20}
            />
            <h2 className='primary-text-color title-h4-bold'>File Paths</h2>
          </div>
          <div className={style.vpxDirectoryWrapper}>
            <Input
              label='VPX Root Directory'
              value={vpxRootPath}
              onChange={setVpxRootPath}
              onBlur={handleUpdateVpxRootPath}
            />
            <div
              className={classNames(
                'secondary-text-color',
                'caption-small-regular',
                style.note,
              )}>
              Primary directory containing <strong>VPinballX.exe.</strong>
            </div>
          </div>
          <div className={style.lockedSettingsWrapper}>
            <LockedSetting
              label='ROMs Directory'
              value={romsDirectory}
              defaultValue={defaultRomsDirectory}
              onSave={handleSaveRomsDirectory}
              lockedNote='Auto-syncing with Root'
              lockedNoteIcon='reload'
            />
            <LockedSetting
              label='Tables Directory'
              value={tablesDirectory}
              defaultValue={defaultTablesDirectory}
              onSave={handleSaveTablesDirectory}
              lockedNote='Auto-syncing with Root'
              lockedNoteIcon='reload'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

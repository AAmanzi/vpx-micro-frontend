import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Input from 'src/components/Input';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import { getDefaultRomsDirectory, getDefaultTablesDirectory } from 'src/utils';

import LockedSetting from '../LockedSetting';
import style from './FilePathsSection.module.scss';

const FilePathsSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [_vpxRootPath, setVpxRootPath] = useState('');
  const [_romsDirectory, setRomsDirectory] = useState('');
  const [_tablesDirectory, setTablesDirectory] = useState('');

  const vpxRootPath = _vpxRootPath || config?.vpxRootPath || '';
  const romsDirectory = _romsDirectory || config?.romsDirectory || '';
  const tablesDirectory = _tablesDirectory || config?.tablesDirectory || '';

  const defaultRomsDirectory = getDefaultRomsDirectory(vpxRootPath);
  const defaultTablesDirectory = getDefaultTablesDirectory(vpxRootPath);

  const handleUpdateVpxRootPath = async () => {
    const { error } = await api.updateVpxRootPath(vpxRootPath);

    if (error) {
      showErrorToast(error.message || 'Failed to update VPX root path');

      return;
    }

    fetchConfig();
  };

  const handleSaveRomsDirectory = async (newValue: string) => {
    setRomsDirectory(newValue);
    const { error } = await api.updateRomsDirectoryPath(newValue);

    if (error) {
      showErrorToast(error.message || 'Failed to update ROMs directory');

      return;
    }

    fetchConfig();
  };

  const handleSaveTablesDirectory = async (newValue: string) => {
    setTablesDirectory(newValue);
    const { error } = await api.updateTablesDirectoryPath(newValue);

    if (error) {
      showErrorToast(error.message || 'Failed to update tables directory');

      return;
    }

    fetchConfig();
  };

  return (
    <>
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
    </>
  );
};

export default FilePathsSection;

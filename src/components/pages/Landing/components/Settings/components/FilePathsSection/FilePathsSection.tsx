import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import FolderPicker from 'src/components/FolderPicker';
import Input from 'src/components/Input';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import {
  getDefaultRomsDirectory,
  getDefaultTablesDirectory,
  getVpxRootPathPermissionWarning,
  normalizePathForComparison,
} from 'src/utils';

import LockedSetting from '../LockedSetting';
import style from './FilePathsSection.module.scss';

const FilePathsSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast, showWarningToast } = useToastContext();

  const [_vpxRootPath, setVpxRootPath] = useState('');
  const [_romsDirectory, setRomsDirectory] = useState('');
  const [_tablesDirectory, setTablesDirectory] = useState('');

  const vpxRootPath = _vpxRootPath || config?.vpxRootPath || '';
  const romsDirectory = _romsDirectory || config?.romsDirectory || '';
  const tablesDirectory = _tablesDirectory || config?.tablesDirectory || '';

  const defaultRomsDirectory = getDefaultRomsDirectory(vpxRootPath);
  const defaultTablesDirectory = getDefaultTablesDirectory(vpxRootPath);
  const vpxRootPathWarning = getVpxRootPathPermissionWarning(vpxRootPath);

  const saveVpxRootPath = async (nextPath: string) => {
    const trimmedPath = nextPath.trim();
    const currentSavedPath = config?.vpxRootPath || '';

    if (
      normalizePathForComparison(trimmedPath) ===
      normalizePathForComparison(currentSavedPath)
    ) {
      return;
    }

    const { error } = await api.updateVpxRootPath(trimmedPath);

    if (error) {
      showErrorToast(error.message || 'Failed to update VPX root path');

      return;
    }

    fetchConfig();
  };

  const handleUpdateVpxRootPath = async () => {
    await saveVpxRootPath(vpxRootPath);
  };

  const handlePickVpxRootPath = async (directory: string) => {
    setVpxRootPath(directory);

    await saveVpxRootPath(directory);
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
        <div className={style.inputWrapper}>
          <Input
            label='VPX Root Directory'
            value={vpxRootPath}
            onChange={setVpxRootPath}
            onBlur={handleUpdateVpxRootPath}
          />
          <FolderPicker
            onSelect={handlePickVpxRootPath}
            onError={showErrorToast}
            label='Browse'
          />
        </div>
        <div
          className={classNames(
            'secondary-text-color',
            'body-xs-regular',
            style.note,
          )}>
          Primary directory containing <strong>VPinballX.exe.</strong>
        </div>
        {vpxRootPathWarning && (
          <div className={classNames('body-xs-regular', style.warningNote)}>
            {vpxRootPathWarning}
          </div>
        )}
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

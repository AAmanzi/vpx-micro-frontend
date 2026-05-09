import classNames from 'classnames';
import { FunctionComponent, MouseEvent, useState } from 'react';

import FilePicker, {
  Size as FilePickerSize,
} from 'src/components/FilePicker/FilePicker';
import FolderPicker from 'src/components/FolderPicker';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './MacOsFilePathsSection.module.scss';

const MacOsFilePathsSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [_romsDirectory, setRomsDirectory] = useState('');
  const [_tablesDirectory, setTablesDirectory] = useState('');
  const [_vpxExecutablePath, setVpxExecutablePath] = useState('');

  const romsDirectory = _romsDirectory || config?.romsDirectory || '';
  const tablesDirectory = _tablesDirectory || config?.tablesDirectory || '';
  const vpxExecutablePath =
    _vpxExecutablePath || config?.vpxExecutablePath || '';

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

  const handleSaveVpxExecutablePath = async (newValue: string) => {
    setVpxExecutablePath(newValue);
    const { error } = await api.updateVpxExecutablePath(newValue);

    if (error) {
      showErrorToast(error.message || 'Failed to update VPX executable path');

      return;
    }

    fetchConfig();
  };

  const handleOpenVpxDownload = async () => {
    const { error } = await api.openExternalUrl(
      'https://github.com/vpinball/vpinball/releases',
    );

    if (error) {
      showErrorToast(error.message || 'Failed to open browser');
    }
  };

  return (
    <>
      <div>
        <div className={style.inputWrapper}>
          <Input
            label='VPX App Path'
            placeholder='/Applications/VPinballX_BGFX.app'
            value={vpxExecutablePath}
            onChange={setVpxExecutablePath}
            onBlur={() => handleSaveVpxExecutablePath(vpxExecutablePath)}
          />
          <FilePicker
            onSelect={handleSaveVpxExecutablePath}
            onError={showErrorToast}
            acceptedExtensions={['.app']}
            label='Browse'
          />
        </div>
        <div className={style.inputWrapper}>
          <Input
            label='Tables Directory'
            placeholder='~/Documents/VPX/Tables'
            value={tablesDirectory}
            onChange={setTablesDirectory}
            onBlur={() => handleSaveTablesDirectory(tablesDirectory)}
          />
          <FolderPicker
            onSelect={handleSaveTablesDirectory}
            onError={showErrorToast}
            label='Browse'
          />
        </div>
        <div className={style.inputWrapper}>
          <Input
            label='ROMs Directory'
            placeholder='~/Documents/VPX/ROMs'
            value={romsDirectory}
            onChange={setRomsDirectory}
            onBlur={() => handleSaveRomsDirectory(romsDirectory)}
          />
          <FolderPicker
            onSelect={handleSaveRomsDirectory}
            onError={showErrorToast}
            label='Browse'
          />
        </div>
      </div>
    </>
  );
};

export default MacOsFilePathsSection;

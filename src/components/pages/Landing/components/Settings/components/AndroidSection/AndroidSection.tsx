import { FunctionComponent, useState } from 'react';

import Input from 'src/components/Input';
import api from 'src/consts';
import {
  VPX_DEFAULT_ANDROID_ROMS_PATH,
  VPX_DEFAULT_ANDROID_TABLES_PATH,
} from 'src/consts/vpx';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './AndroidSection.module.scss';

const AndroidSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [_androidWebServerUrl, setAndroidWebServerUrl] = useState('');
  const [_androidTablesDirectory, setAndroidTablesDirectory] = useState('');
  const [_androidRomsDirectory, setAndroidRomsDirectory] = useState('');

  const androidWebServerUrl =
    _androidWebServerUrl || config?.androidWebServerUrl || '';
  const androidTablesDirectory =
    _androidTablesDirectory ||
    config?.androidTablesDirectory ||
    VPX_DEFAULT_ANDROID_TABLES_PATH;
  const androidRomsDirectory =
    _androidRomsDirectory ||
    config?.androidRomsDirectory ||
    VPX_DEFAULT_ANDROID_ROMS_PATH;

  const handleSaveAndroidWebServerUrl = async () => {
    const nextValue = androidWebServerUrl.trim();

    if (nextValue === (config?.androidWebServerUrl || '')) {
      return;
    }

    const { error } = await api.updateAndroidWebServerUrl(nextValue);

    if (error) {
      showErrorToast(error.message || 'Failed to update Android server URL');
      return;
    }

    fetchConfig();
  };

  const handleSaveAndroidTablesDirectory = async () => {
    const nextValue = androidTablesDirectory.trim();

    if (nextValue === (config?.androidTablesDirectory || '')) {
      return;
    }

    const { error } = await api.updateAndroidTablesDirectoryPath(nextValue);

    if (error) {
      showErrorToast(
        error.message || 'Failed to update Android tables directory',
      );
      return;
    }

    fetchConfig();
  };

  const handleSaveAndroidRomsDirectory = async () => {
    const nextValue = androidRomsDirectory.trim();

    if (nextValue === (config?.androidRomsDirectory || '')) {
      return;
    }

    const { error } = await api.updateAndroidRomsDirectoryPath(nextValue);

    if (error) {
      showErrorToast(
        error.message || 'Failed to update Android ROMs directory',
      );
      return;
    }

    fetchConfig();
  };

  return (
    <div className={style.container}>
      <Input
        label='Android Web Server URL'
        value={androidWebServerUrl}
        onChange={setAndroidWebServerUrl}
        onBlur={handleSaveAndroidWebServerUrl}
        placeholder='192.168.0.0:2112'
      />
      <Input
        label='Android Tables Directory'
        value={androidTablesDirectory}
        onChange={setAndroidTablesDirectory}
        onBlur={handleSaveAndroidTablesDirectory}
      />
      <Input
        label='Android ROMs Directory'
        value={androidRomsDirectory}
        onChange={setAndroidRomsDirectory}
        onBlur={handleSaveAndroidRomsDirectory}
      />
      <p className='secondary-text-color body-xs-regular'>
        These values are used by Android scan and sync features.
      </p>
    </div>
  );
};

export default AndroidSection;

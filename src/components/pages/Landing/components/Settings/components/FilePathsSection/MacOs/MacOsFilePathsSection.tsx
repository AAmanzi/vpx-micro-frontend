import { FunctionComponent, useEffect, useState } from 'react';

import Button, { Type as ButtonType } from 'src/components/Button';
import FilePicker from 'src/components/FilePicker/FilePicker';
import FolderPicker from 'src/components/FolderPicker';
import Input from 'src/components/Input';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './MacOsFilePathsSection.module.scss';
import VpxSetupGuideModal from './components/VpxSetupGuideModal';

const MacOsFilePathsSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [_romsDirectory, setRomsDirectory] = useState('');
  const [_tablesDirectory, setTablesDirectory] = useState('');
  const [_vpxExecutablePath, setVpxExecutablePath] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useEffect(() => {
    setRomsDirectory('');
  }, [config?.romsDirectory]);
  useEffect(() => {
    setTablesDirectory('');
  }, [config?.tablesDirectory]);
  useEffect(() => {
    setVpxExecutablePath('');
  }, [config?.vpxExecutablePath]);

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

  return (
    <>
      <div>
        <div className={style.setupCallout}>
          <div>
            <p className='primary-text-color body-md-bold'>
              Don&apos;t have VPX installed or prefer a guided setup?
            </p>
            <p className='secondary-text-color body-sm-regular'>
              Use the setup guide to install VPX and configure required folders,
              then come back here any time to edit paths manually.
            </p>
          </div>
          <div className={style.setupCalloutButtonWrapper}>
            <Button
              label='Begin Setup'
              type={ButtonType.secondary}
              onClick={() => setIsSetupModalOpen(true)}
              icon='cog'
            />
          </div>
        </div>
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
      {isSetupModalOpen && (
        <VpxSetupGuideModal
          onClose={() => {
            setIsSetupModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default MacOsFilePathsSection;

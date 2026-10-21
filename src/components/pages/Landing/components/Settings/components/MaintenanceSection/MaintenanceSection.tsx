import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import CheckboxSwitch from 'src/components/CheckboxSwitch';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';

import style from './MaintenanceSection.module.scss';

const MaintenanceSection: FunctionComponent = () => {
  const { showErrorToast, showSuccessToast } = useToastContext();
  const { fetchTables } = useTablesContext();
  const { config, fetchConfig, platform } = useConfigContext();

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    api.isFullScreen().then((result) => {
      if (result.success) {
        setIsFullScreen(result.data);
      }
    });

    return api.onFullScreenChanged(setIsFullScreen);
  }, []);

  const handleToggleFullScreen = async () => {
    const result = await api.setFullScreen(!isFullScreen);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to change fullscreen');
      return;
    }

    setIsFullScreen(!isFullScreen);
  };

  const openConfirmation = () => {
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    if (!isClearing) setIsConfirmationOpen(false);
  };

  const handleClearLibrary = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      const result = await api.clearTables();
      if (result.success) {
        setIsConfirmationOpen(false);
        fetchTables();
        if (result.warning) {
          showErrorToast(
            result.warning.message ||
              'Library cleared, but config backup cleanup was incomplete',
          );
        } else {
          showSuccessToast(
            'Library data and config backups cleared successfully',
          );
        }
      } else {
        showErrorToast(result.error.message || 'Something went wrong');
      }
    } catch {
      showErrorToast('Failed to clear library data');
    } finally {
      setIsClearing(false);
    }
  };

  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);

  const handleToggleAndroidFeatures = async () => {
    const result = await api.updateAndroidFeaturesEnabled(
      !androidFeaturesEnabled,
    );

    if (!result.success) {
      showErrorToast(
        result.error.message || 'Failed to update Android features',
      );
      return;
    }

    fetchConfig();
  };

  return (
    <>
      <div className={style.settingsRow}>
        <div>
          <p className='primary-text-color body-md-semibold'>Fullscreen</p>
          <p className='secondary-text-color body-xs-regular'>
            Hide the window frame and fill the screen. Press{' '}
            {platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11'} to toggle at any
            time. The window state is remembered between launches.
          </p>
        </div>
        <CheckboxSwitch
          checked={isFullScreen}
          onChange={handleToggleFullScreen}
          color='green'
        />
      </div>
      <div className={style.settingsRow}>
        <div>
          <p className='primary-text-color body-md-semibold'>
            Android Features
          </p>
          <p className='secondary-text-color body-xs-regular'>
            Enable Android-focused features and settings in the app.
          </p>
        </div>
        <CheckboxSwitch
          checked={androidFeaturesEnabled}
          onChange={handleToggleAndroidFeatures}
          color='green'
        />
      </div>

      <div className={style.clearLibraryWrapper}>
        <div>
          <p className='accent-error-text-color body-md-semibold'>
            Clear Library Data
          </p>
          <p className='secondary-text-color body-xs-regular'>
            Reset your table list and delete all config backups. Table files and
            active settings (.ini) will be kept.
          </p>
        </div>
        <div className={style.buttonWrapper}>
          <Button
            icon='trash'
            label='Clear All'
            onClick={openConfirmation}
            type={ButtonType.danger}
            size={ButtonSize.small}
          />
        </div>
      </div>
      {isConfirmationOpen && (
        <Modal
          title='Clear Library Data'
          description='Are you sure you want to clear your library data?'
          modalClassName={style.modal}
          onExitClick={closeConfirmation}
          size={ModalSize.small}
          color='red'>
          <div className={style.content}>
            <p className={style.text}>
              This will reset your table list and permanently delete all config
              backups, including saved configuration names and timestamps.
            </p>
            <p className={style.notice}>
              Your table files and active settings (.ini) will be kept.
            </p>
          </div>
          <div className={style.footer}>
            <Button
              size={ButtonSize.small}
              type={ButtonType.transparent}
              label='Cancel'
              disabled={isClearing}
              onClick={closeConfirmation}
            />
            <Button
              size={ButtonSize.small}
              type={ButtonType.danger}
              label='Confirm'
              loading={isClearing}
              onClick={handleClearLibrary}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default MaintenanceSection;

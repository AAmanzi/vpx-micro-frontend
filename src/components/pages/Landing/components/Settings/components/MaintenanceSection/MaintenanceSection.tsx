import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

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
  const { config, fetchConfig } = useConfigContext();

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const openConfirmation = () => {
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  const handleClearLibrary = () => {
    api.clearTables().then((result) => {
      if (result.success) {
        closeConfirmation();
        fetchTables();
        showSuccessToast('Library data cleared successfully');
      } else {
        showErrorToast(result.error.message || 'Something went wrong');
      }
    });
  };

  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);

  const handleToggleAndroidFeatures = async () => {
    const result = await api.updateAndroidFeaturesEnabled(
      !androidFeaturesEnabled,
    );

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to update Android features');
      return;
    }

    fetchConfig();
  };

  return (
    <>
      <div className={style.settingsRow}>
        <div>
          <p className='primary-text-color body-md-semibold'>Android Features</p>
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
            This will reset your table list but won't delete actual files.
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
              This will reset your table list but won't delete actual files.
            </p>
          </div>
          <div className={style.footer}>
            <Button
              size={ButtonSize.small}
              type={ButtonType.transparent}
              label='Cancel'
              onClick={closeConfirmation}
            />
            <Button
              size={ButtonSize.small}
              type={ButtonType.danger}
              label='Confirm'
              onClick={handleClearLibrary}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default MaintenanceSection;

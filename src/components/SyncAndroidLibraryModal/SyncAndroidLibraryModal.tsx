import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Modal, { Size as ModalSize } from 'src/components/Modal';
import Spinner from 'src/components/Spinner';
import { api } from 'src/consts';
import { useToastContext } from 'src/providers/toast';
import { AndroidScanResult } from 'src/types/android';

import style from './SyncAndroidLibraryModal.module.scss';
import RetryConnectionForm from './components/RetryConnectionForm';
import SyncResults from './components/SyncResults';

interface Props {
  close: () => void;
}

const SyncAndroidLibraryModal: FunctionComponent<Props> = ({ close }) => {
  const { showErrorToast, showWarningToast } = useToastContext();

  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [scanResult, setScanResult] = useState<AndroidScanResult | null>(null);

  const getTitle = () => {
    if (isLoading) {
      return 'Sync Android Library';
    }

    if (connectionError) {
      return 'Connection Error';
    }

    return 'Android Scan Results';
  };
  const title = getTitle();

  const getDescription = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (connectionError) {
      return 'Failed to connect to the Android server. Please check your connection and try again.';
    }

    return '';
  };
  const description = getDescription();

  const scanAndroidLibrary = async () => {
    setIsLoading(true);
    setConnectionError(false);
    setScanResult(null);

    const result = await api.scanAndroidLibrary();

    if (result.success) {
      setScanResult(result.data);

      if (result.warning) {
        showWarningToast(
          result.warning.message ||
            'Some local files were missing and were skipped during scan.',
        );
      }

      setIsLoading(false);
      return;
    }

    setConnectionError(true);
    showErrorToast(
      result.error.message || 'Failed to connect to Android server',
    );
    setIsLoading(false);
  };

  useEffect(() => {
    scanAndroidLibrary();
  }, []);

  return (
    <Modal
      title={title}
      description={description}
      onExitClick={close}
      size={ModalSize.large}
      color='purple'>
      <div className={style.content}>
        {isLoading && (
          <div className={style.loadingWrapper}>
            <Spinner size={54} />
            <p
              className={classNames('secondary-text-color', 'body-sm-regular')}>
              Pinging Android server...
            </p>
          </div>
        )}

        {connectionError && (
          <RetryConnectionForm
            close={close}
            isRetrying={isLoading}
            handleRetry={scanAndroidLibrary}
          />
        )}

        {!isLoading && scanResult && !connectionError && (
          <SyncResults
            close={close}
            scanResult={scanResult}
            onRescan={scanAndroidLibrary}
            isRescanning={isLoading}
          />
        )}
      </div>
    </Modal>
  );
};

export default SyncAndroidLibraryModal;

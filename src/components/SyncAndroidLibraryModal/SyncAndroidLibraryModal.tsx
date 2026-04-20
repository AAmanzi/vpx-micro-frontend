import classNames from 'classnames';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

import Modal, { Size as ModalSize } from 'src/components/Modal';
import Spinner from 'src/components/Spinner';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './SyncAndroidLibraryModal.module.scss';
import RetryConnectionForm from './components/RetryConnectionForm';

enum Status {
  loading = 'loading',
  connectionError = 'connectionError',
  success = 'success',
}

interface Props {
  close: () => void;
}

const SyncAndroidLibraryModal: FunctionComponent<Props> = ({ close }) => {
  const { showErrorToast } = useToastContext();

  const [status, setStatus] = useState(Status.loading);
  const [isRetrying, setIsRetrying] = useState(false);

  const scanAndroidLibrary = async () => {
    setStatus(Status.loading);

    const result = await api.scanAndroidLibrary();

    if (result.success) {
      setStatus(Status.success);
      return;
    }

    showErrorToast(
      result.error.message || 'Failed to connect to Android server',
    );

    setStatus(Status.connectionError);
  };

  useEffect(() => {
    scanAndroidLibrary();
  }, []);

  const handleRetry = async () => {
    if (isRetrying) {
      return;
    }

    setIsRetrying(true);

    await scanAndroidLibrary();
    setIsRetrying(false);
  };

  const title = useMemo(() => {
    switch (status) {
      case Status.success:
        return 'Android Scan Results';
      case Status.connectionError:
        return 'Android Server Unreachable';
      case Status.loading:
      default:
        return 'Sync Android Library';
    }
  }, [status]);

  const description = useMemo(() => {
    switch (status) {
      case Status.success:
        return 'Review the results of the scan and apply changes to your library.';
      case Status.connectionError:
        return 'Update the Android server URL and try again.';
      case Status.loading:
      default:
        return 'Trying to contact the configured Android web server...';
    }
  }, [status]);

  return (
    <Modal
      title={title}
      description={description}
      onExitClick={close}
      size={ModalSize.large}
      color={status === Status.connectionError ? 'red' : 'purple'}>
      <div className={style.content}>
        {status === Status.loading && (
          <div className={style.loadingWrapper}>
            <Spinner size={54} />
            <p
              className={classNames('secondary-text-color', 'body-sm-regular')}>
              Pinging Android server...
            </p>
          </div>
        )}

        {status === Status.connectionError && (
          <RetryConnectionForm
            close={close}
            handleRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}

        {status === Status.success && (
          <div className={style.successWrapper}></div>
        )}
      </div>
    </Modal>
  );
};

export default SyncAndroidLibraryModal;

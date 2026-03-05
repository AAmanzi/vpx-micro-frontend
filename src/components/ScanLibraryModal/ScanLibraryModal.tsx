import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Modal from 'src/components/Modal';
import Spinner from 'src/components/Spinner';
import { api } from 'src/consts';
import { ScanResult } from 'src/types/table';

import style from './ScanLibraryModal.module.scss';

interface Props {
  close: () => void;
}

const ScanLibraryModal: FunctionComponent<Props> = ({ close }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const modalTitle = isLoading ? 'Scanning VPX Library' : 'Scan Results';
  const modalDescription = isLoading
    ? 'Comparing database with disk files...'
    : 'Review the results of the scan and apply changes to your library.';

  useEffect(() => {
    api.scanVpxLibrary().then((result) => {
      if (result.success) {
        setScanResult(result.data);
      }

      setIsLoading(false);
    });
  }, []);

  return (
    <Modal
      title={modalTitle}
      description={modalDescription}
      onExitClick={close}>
      <div>
        {!isLoading && scanResult && <div></div>}
        {isLoading && (
          <div className={style.loadingWrapper}>
            <Spinner />
            <p
              className={classNames(
                'primary-text-color',
                'title-h4-bold',
                style.loadingTitle,
              )}>
              Scanning VPX library
            </p>
            <p className='secondary-text-color caption-medium-regular'>
              Analyzing tables and ROMs...
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScanLibraryModal;

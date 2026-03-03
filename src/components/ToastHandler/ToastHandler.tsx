import { FunctionComponent } from 'react';

import Toast, { Type as ToastType } from 'src/components/Toast';
import { useToastContext } from 'src/providers/toast';

const ToastHandler: FunctionComponent = () => {
  const {
    errorToast,
    closeErrorToast,
    successToast,
    closeSuccessToast,
    warningToast,
    closeWarningToast,
  } = useToastContext();

  return (
    <>
      <Toast
        type={ToastType.error}
        close={closeErrorToast}
        isOpen={errorToast.isOpen}
        message={errorToast.message || ''}
      />
      <Toast
        type={ToastType.success}
        close={closeSuccessToast}
        isOpen={successToast.isOpen}
        message={successToast.message || ''}
      />
      <Toast
        type={ToastType.warning}
        close={closeWarningToast}
        isOpen={warningToast.isOpen}
        message={warningToast.message || ''}
      />
    </>
  );
};

export default ToastHandler;

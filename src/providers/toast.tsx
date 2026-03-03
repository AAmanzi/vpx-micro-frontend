import { ReactElement, createContext, useContext, useState } from 'react';

export interface ToastData {
  isOpen: boolean;
  message: string | null;
}

interface ToastContextType {
  errorToast: ToastData;
  successToast: ToastData;
  warningToast: ToastData;

  showErrorToast: (message: string) => void;
  closeErrorToast: () => void;
  showSuccessToast: (message: string) => void;
  closeSuccessToast: () => void;
  showWarningToast: (message: string) => void;
  closeWarningToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const initialToastData = {
  isOpen: false,
  message: null,
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }

  return context;
};

export default function ToastProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const [errorToast, setErrorToast] = useState<ToastData>(initialToastData);
  const [successToast, setSuccessToast] = useState<ToastData>(initialToastData);
  const [warningToast, setWarningToast] = useState<ToastData>(initialToastData);

  const closeErrorToast = () => {
    setErrorToast((prev) => ({ ...prev, isOpen: false }));
  };
  const closeSuccessToast = () => {
    setSuccessToast((prev) => ({ ...prev, isOpen: false }));
  };
  const closeWarningToast = () => {
    setWarningToast((prev) => ({ ...prev, isOpen: false }));
  };

  const showErrorToast = (message: string) => {
    if (!errorToast.isOpen && !successToast.isOpen) {
      setErrorToast({
        isOpen: true,
        message,
      });

      return;
    }

    closeErrorToast();
    closeWarningToast();
    closeSuccessToast();

    window.setTimeout(() => {
      setErrorToast({
        isOpen: true,
        message,
      });
    }, 300);
  };

  const showSuccessToast = (message: string) => {
    if (!successToast.isOpen && !errorToast.isOpen) {
      setSuccessToast({
        isOpen: true,
        message,
      });

      return;
    }

    closeSuccessToast();
    closeWarningToast();
    closeErrorToast();

    window.setTimeout(() => {
      setSuccessToast({
        isOpen: true,
        message,
      });
    }, 300);
  };

  const showWarningToast = (message: string) => {
    if (!warningToast.isOpen && !errorToast.isOpen && !successToast.isOpen) {
      setWarningToast({
        isOpen: true,
        message,
      });

      return;
    }

    closeWarningToast();
    closeErrorToast();
    closeSuccessToast();

    window.setTimeout(() => {
      setWarningToast({
        isOpen: true,
        message,
      });
    }, 300);
  };

  const providerValue = {
    errorToast,
    successToast,
    warningToast,
    closeSuccessToast,
    showSuccessToast,
    closeErrorToast,
    showErrorToast,
    closeWarningToast,
    showWarningToast,
  };

  return (
    <ToastContext.Provider value={providerValue}>
      {children}
    </ToastContext.Provider>
  );
}

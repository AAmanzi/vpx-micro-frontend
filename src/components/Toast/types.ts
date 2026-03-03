export enum Type {
  success = 'success',
  error = 'error',
  warning = 'warning',
}

export interface Props {
  message: string;
  isOpen: boolean;
  type?: Type;
  close: () => void;
}

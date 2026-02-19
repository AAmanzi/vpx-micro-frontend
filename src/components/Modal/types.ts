import { Type as ButtonType } from 'src/components/Button';

export enum Size {
  small = 'small',
  medium = 'medium',
  unset = 'unset',
}

export interface Props {
  modalClassName?: string;
  title?: string;
  titleClassName?: string;
  description?: string;
  onExitClick?: () => void;
  showExitButton?: boolean;
  buttonType?: ButtonType;
  headerClassName?: string;
  allowOverflow?: boolean;
  children: React.ReactNode;
  size?: Size;
}

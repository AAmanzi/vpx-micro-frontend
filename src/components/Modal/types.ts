import { Type as ButtonType } from 'src/components/Button';

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
}

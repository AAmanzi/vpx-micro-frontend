import { Icon } from '../Icon/types';

export enum Type {
  info = 'info',
  success = 'success',
  warning = 'warning',
}

export interface Props {
  label: string;
  icon?: Icon;
  type?: Type;
}

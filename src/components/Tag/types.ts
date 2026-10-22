import { Icon } from '../Icon/types';

export enum Type {
  info = 'info',
  purple = 'purple',
  success = 'success',
  warning = 'warning',
}

export interface Props {
  label: string;
  icon?: Icon;
  type?: Type;
}

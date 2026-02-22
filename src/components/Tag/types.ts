import { Icon } from '../Icon/types';

export enum Type {
  info = 'info',
  success = 'success',
}

export interface Props {
  label: string;
  icon?: Icon;
  type?: Type;
}

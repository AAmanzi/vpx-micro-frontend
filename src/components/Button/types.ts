import { Icon } from 'src/components/Icon/types';

export enum Type {
  primary = 'primary',
  secondary = 'secondary',
}

export enum Size {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export interface Props {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  type?: Type;
  icon?: Icon;
  size?: Size;
  fill?: boolean;
  circle?: boolean;
}

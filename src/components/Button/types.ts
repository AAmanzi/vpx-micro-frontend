import { Icon } from 'src/components/Icon/types';

export enum Type {
  primary = 'primary',
  secondary = 'secondary',
  transparent = 'transparent',
  danger = 'danger',
  primaryAlt = 'primaryAlt',
  primaryAltTransparent = 'primaryAltTransparent',
  success = 'success',
  successTransparent = 'successTransparent',
}

export enum Size {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export interface Props {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: Type;
  icon?: Icon;
  size?: Size;
  fill?: boolean;
  circle?: boolean;
  isSubmit?: boolean;
}

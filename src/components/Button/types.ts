export enum Type {
  primary = 'primary',
  secondary = 'secondary',
}

export interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  type?: Type;
}

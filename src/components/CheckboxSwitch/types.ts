export interface Props {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
  showDisabled?: boolean;
  color?: 'blue' | 'red' | 'green' | 'yellow';
}

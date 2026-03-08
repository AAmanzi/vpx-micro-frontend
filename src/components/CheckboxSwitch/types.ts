export interface Props {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  showDisabled?: boolean;
  color?: 'blue' | 'red' | 'green' | 'yellow';
}

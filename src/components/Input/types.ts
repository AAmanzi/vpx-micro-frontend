import { FocusEvent, KeyboardEvent } from 'react';

import { Icon } from '../Icon/types';

export enum Size {
  small = 'small',
  medium = 'medium',
  big = 'big',
}

export type Props = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  forceFocus?: boolean;
  onBlur?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  size?: Size;
  error?: boolean;
  label?: string;
  errorMessage?: string | null;
  inputType?: string;
  inputMode?:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search';
  autoFocus?: boolean;
  readonly?: boolean;
  icon?: Icon;
};

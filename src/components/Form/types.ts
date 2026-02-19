import { ReactNode } from 'react';

export interface Props {
  validate?: () => boolean;
  submit: () => void;
  children: ReactNode;
}

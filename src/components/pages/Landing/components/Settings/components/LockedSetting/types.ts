import { Icon as IconType } from 'src/components/Icon/types';

export enum PickerType {
  folder = 'folder',
  file = 'file',
}

export interface Props {
  label: string;
  value: string;
  defaultValue: string;
  onSave: (value: string) => void;
  lockedNote?: string;
  lockedNoteIcon?: IconType;
  pickerType?: PickerType;
  acceptedExtensions?: string[];
}

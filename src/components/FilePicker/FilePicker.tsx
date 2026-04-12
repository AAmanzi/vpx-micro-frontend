import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import api from 'src/consts';
import { normalizePath } from 'src/utils';

import Icon from '../Icon';
import style from './FilePicker.module.scss';

export enum Size {
  small = 'small',
  medium = 'medium',
  big = 'big',
}

interface Props {
  onSelect: (filePath: string) => void;
  acceptedExtensions: string[];
  onError?: (message: string) => void;
  disabled?: boolean;
  label?: string;
  size?: Size;
}

const FilePicker: FunctionComponent<Props> = ({
  onSelect,
  acceptedExtensions,
  onError,
  disabled = false,
  label = 'Browse file',
  size = Size.medium,
}) => {
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = async () => {
    if (disabled || isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      const result = await api.openFilePicker(acceptedExtensions, false);

      if (!result.success) {
        onError?.(result.error.message || 'Failed to open file picker');

        return;
      }

      if (!result.data || result.data.length === 0) {
        return;
      }

      onSelect(normalizePath(result.data[0].path));
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <button
      type='button'
      className={classNames(style.container, {
        [style.small]: size === Size.small,
        [style.medium]: size === Size.medium,
        [style.big]: size === Size.big,
        [style.disabled]: disabled || isPicking,
      })}
      onClick={handlePick}
      disabled={disabled || isPicking}>
      <Icon icon='folder' width={14} height={14} className={style.icon} />
      <span className='body-sm-regular'>{label}</span>
    </button>
  );
};

export default FilePicker;

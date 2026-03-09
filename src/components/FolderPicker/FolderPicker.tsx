import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import api from 'src/consts';

import Icon from '../Icon';
import style from './FolderPicker.module.scss';

export enum Size {
  small = 'small',
  medium = 'medium',
  big = 'big',
}

interface Props {
  onSelect: (directoryPath: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  label?: string;
  size?: Size;
}

const FolderPicker: FunctionComponent<Props> = ({
  onSelect,
  onError,
  disabled = false,
  label = 'Browse',
  size = Size.medium,
}) => {
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = async () => {
    if (disabled || isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      const result = await api.openDirectoryPicker();

      if (!result.success) {
        onError?.(result.error.message || 'Failed to open folder picker');

        return;
      }

      if (!result.data) {
        return;
      }

      onSelect(result.data);
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

export default FolderPicker;

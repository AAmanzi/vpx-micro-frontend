import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';
import { FileSystemItem } from 'src/types/file';

import style from './UnassignedRomEntry.module.scss';

interface Props {
  rom: FileSystemItem;
  onRemove: (rom: FileSystemItem) => void;
}

const UnassignedRomEntry: FunctionComponent<Props> = ({ onRemove, rom }) => {
  return (
    <div className={style.container}>
      <div className={style.iconWrapper}>
        <Icon
          className='secondary-text-color'
          icon='archive'
          width={14}
          height={14}
        />
      </div>
      <div className='secondary-text-color body-sm-regular'>
        {rom.name}
      </div>
      <button
        type='button'
        onClick={() => onRemove(rom)}
        className={style.removeButton}>
        <Icon
          className='secondary-text-color'
          icon='trash'
          width={14}
          height={14}
        />
      </button>
    </div>
  );
};

export default UnassignedRomEntry;

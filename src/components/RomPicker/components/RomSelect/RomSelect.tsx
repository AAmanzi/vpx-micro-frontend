import classNames from 'classnames';
import { FunctionComponent, useRef } from 'react';

import { FileSystemItem } from 'src/types/file';
import useClickOutside from 'src/utils/useClickOutside';

import style from './RomSelect.module.scss';

interface Props {
  options: Array<FileSystemItem>;
  onSelect: (rom: FileSystemItem) => void;
  onClose: () => void;
}

const RomSelect: FunctionComponent<Props> = ({
  options,
  onSelect,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, onClose);

  const handleSelect = (rom: FileSystemItem) => () => {
    onSelect(rom);
    onClose();
  };

  return (
    <div className={style.container} ref={ref}>
      <div
        className={classNames(
          'secondary-text-color',
          'body-xs-semibold',
          'uppercase',
          style.title,
        )}>
        Select ROM
      </div>
      <div>
        {options.map((rom) => (
          <button
            type='button'
            key={rom.path}
            className={style.option}
            onClick={handleSelect(rom)}>
            <span className='primary-text-color body-md-semibold'>
              {rom.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RomSelect;

import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { FileSystemItem } from 'src/types/file';

import Icon from '../Icon';
import Tag, { Type as TagType } from '../Tag';
import style from './RomPicker.module.scss';
import RomSelect from './components/RomSelect';

interface Props {
  selectedRom: FileSystemItem | null;
  options: Array<FileSystemItem>;
  expectedRomName: string | null;
  onRemoveRom: () => void;
  onSelect: (rom: FileSystemItem) => void;
}

const RomPicker: FunctionComponent<Props> = ({
  selectedRom,
  options,
  expectedRomName,
  onRemoveRom,
  onSelect,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const hasOptions = options.length > 0;

  const handleToggleIsSelectOpen = () => {
    if (hasOptions) {
      setIsSelectOpen((prev) => !prev);
    }
  };

  if (selectedRom) {
    return (
      <div className={style.romInfo}>
        <Tag icon='package' label={selectedRom.name} type={TagType.success} />
        <button
          type='button'
          className={classNames(style.removeButton, style.small)}
          onClick={onRemoveRom}>
          <Icon
            className={style.removeIcon}
            icon='cross'
            width={14}
            height={14}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={style.assignRom}>
      <button
        type='button'
        className={classNames(style.assignButton, {
          [style.noRomExpected]: !expectedRomName,
          [style.romExpected]: expectedRomName,
        })}
        onClick={handleToggleIsSelectOpen}
        disabled={!hasOptions}>
        <Icon
          className={style.assignIcon}
          icon={expectedRomName ? 'circle-alert' : 'circle-checkmark'}
          width={10}
          height={10}
        />
        <span className='body-xs-bold'>
          {expectedRomName
            ? `Expected: ${expectedRomName}.zip`
            : 'No ROM expected'}
        </span>
        {hasOptions && (
          <Icon
            className={classNames(style.chevronIcon, {
              [style.open]: isSelectOpen,
            })}
            icon='chevron-down'
            width={10}
            height={10}
          />
        )}
      </button>
      {isSelectOpen && (
        <RomSelect
          options={options}
          onSelect={onSelect}
          onClose={() => setIsSelectOpen(false)}
        />
      )}
    </div>
  );
};

export default RomPicker;

import classNames from 'classnames';
import { FunctionComponent, useCallback, useRef, useState } from 'react';

import { FileSystemItem } from 'src/types/file';
import useClickOutside from 'src/utils/useClickOutside';

import Icon from '../Icon';
import Tag, { Type as TagType } from '../Tag';
import style from './RomPicker.module.scss';
import RomSelect from './components/RomSelect';

interface Props {
  selectedRom: FileSystemItem | null;
  manuallyImportedRoms: Array<FileSystemItem>;
  scannedRoms: Array<FileSystemItem>;
  libraryRoms: Array<FileSystemItem>;
  expectedRomName: string | null;
  onRemoveRom: () => void;
  onSelect: (rom: FileSystemItem) => void;
}

const RomPicker: FunctionComponent<Props> = ({
  selectedRom,
  manuallyImportedRoms,
  scannedRoms,
  libraryRoms,
  expectedRomName,
  onRemoveRom,
  onSelect,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeSelect = useCallback(() => setIsSelectOpen(false), []);
  useClickOutside(pickerRef, closeSelect, { ignoreRef: menuRef });

  const hasOptions =
    manuallyImportedRoms.length > 0 ||
    scannedRoms.length > 0 ||
    libraryRoms.length > 0;

  const handleToggleIsSelectOpen = () => {
    if (hasOptions) {
      setIsSelectOpen((prev) => !prev);
    }
  };

  if (selectedRom) {
    return (
      <div className={style.assignRom} ref={pickerRef}>
        <div className={style.romInfo}>
          <Tag icon='package' label={selectedRom.name} type={TagType.success} />
          <button
            type='button'
            className={classNames(style.removeButton, style.small)}
            onClick={onRemoveRom}>
            <Icon
              className={classNames('secondary-text-color', style.removeIcon)}
              icon='cross'
              width={14}
              height={14}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={style.assignRom} ref={pickerRef}>
      <button
        ref={buttonRef}
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
          buttonRef={buttonRef}
          menuRef={menuRef}
          manuallyImportedRoms={manuallyImportedRoms}
          scannedRoms={scannedRoms}
          libraryRoms={libraryRoms}
          expectedRomName={expectedRomName}
          onSelect={onSelect}
          onClose={closeSelect}
        />
      )}
    </div>
  );
};

export default RomPicker;

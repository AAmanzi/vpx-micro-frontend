import classNames from 'classnames';
import { FunctionComponent, RefObject, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import { FileSystemItem } from 'src/types/file';
import { mergeRoms, normalizePathForComparison } from 'src/utils';
import usePickerMenuPosition from 'src/utils/usePickerMenuPosition';

import style from './RomSelect.module.scss';

interface Props {
  buttonRef: RefObject<HTMLButtonElement>;
  menuRef: RefObject<HTMLDivElement>;
  manuallyImportedRoms: Array<FileSystemItem>;
  scannedRoms: Array<FileSystemItem>;
  libraryRoms: Array<FileSystemItem>;
  expectedRomName: string | null;
  onSelect: (rom: FileSystemItem) => void;
  onClose: () => void;
}

interface RomGroup {
  title: string;
  roms: Array<FileSystemItem>;
  type: 'correctMatch' | 'manualImport' | 'scanned' | 'library';
  isManualImport?: boolean;
  isScanned?: boolean;
}

const normalizeRomName = (name: string): string =>
  name
    .trim()
    .replace(/\.zip$/i, '')
    .toLowerCase();

const RomSelect: FunctionComponent<Props> = ({
  buttonRef,
  menuRef,
  manuallyImportedRoms,
  scannedRoms,
  libraryRoms,
  expectedRomName,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const libraryPaths = new Set(
      libraryRoms.map((rom) => normalizePathForComparison(rom.path)),
    );
    const manualRoms = mergeRoms(manuallyImportedRoms).filter(
      (rom) => !libraryPaths.has(normalizePathForComparison(rom.path)),
    );
    const manualPaths = new Set(
      manualRoms.map((rom) => normalizePathForComparison(rom.path)),
    );
    const uniqueScannedRoms = mergeRoms(scannedRoms).filter((rom) => {
      const path = normalizePathForComparison(rom.path);

      return !libraryPaths.has(path) && !manualPaths.has(path);
    });
    const uniqueLibraryRoms = mergeRoms(libraryRoms);
    const roms = mergeRoms(manualRoms, uniqueScannedRoms, uniqueLibraryRoms);
    const correctName = expectedRomName
      ? normalizeRomName(expectedRomName)
      : '';
    const correctMatches = correctName
      ? roms.filter((rom) => normalizeRomName(rom.name) === correctName)
      : [];
    const correctPaths = new Set(
      correctMatches.map((rom) => normalizePathForComparison(rom.path)),
    );
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = (rom: FileSystemItem) =>
      !normalizedQuery || rom.name.toLowerCase().includes(normalizedQuery);
    const filterGroup = (items: Array<FileSystemItem>) =>
      items.filter(
        (rom) =>
          !correctPaths.has(normalizePathForComparison(rom.path)) &&
          matchesQuery(rom),
      );

    return [
      {
        title: 'Correct match',
        roms: correctMatches.filter(matchesQuery),
        type: 'correctMatch' as const,
      },
      {
        title: 'Manually imported',
        roms: filterGroup(manualRoms),
        type: 'manualImport' as const,
        isManualImport: true,
      },
      {
        title: 'Scanned',
        roms: filterGroup(uniqueScannedRoms),
        type: 'scanned' as const,
        isScanned: true,
      },
      {
        title: 'In library',
        roms: filterGroup(uniqueLibraryRoms),
        type: 'library' as const,
      },
    ].filter((group) => group.roms.length > 0);
  }, [expectedRomName, libraryRoms, manuallyImportedRoms, query, scannedRoms]);
  const menuStyle = usePickerMenuPosition(
    true,
    buttonRef,
    menuRef,
    groups,
    onClose,
  );

  const handleSelect = (rom: FileSystemItem) => () => {
    onSelect(rom);
    onClose();
  };

  const modalRoot =
    typeof document === 'undefined' ? null : document.querySelector('#modal');

  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <div className={style.container} ref={menuRef} style={menuStyle}>
      <div className={style.search}>
        <Input
          value={query}
          onChange={setQuery}
          icon='search'
          placeholder='Search ROMs'
          size={InputSize.small}
        />
        {query && (
          <button
            type='button'
            className={style.clearButton}
            aria-label='Clear ROM search'
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setQuery('')}>
            <Icon icon='cross' width={10} height={10} />
          </button>
        )}
      </div>
      {groups.length === 0 ? (
        <div
          className={classNames(
            'secondary-text-color',
            'body-sm-regular',
            style.emptyState,
          )}>
          No ROMs found
        </div>
      ) : (
        groups.map((group: RomGroup) => (
          <section className={style.group} key={group.title}>
            <div
              className={classNames(
                'body-xs-semibold',
                style.groupTitle,
                style[group.type],
              )}>
              {group.title}
            </div>
            {group.roms.map((rom) => (
              <button
                type='button'
                key={rom.path}
                className={style.option}
                onClick={handleSelect(rom)}>
                <span className='primary-text-color body-sm-semibold'>
                  {rom.name}
                </span>
                {group.isManualImport && (
                  <span
                    className={classNames(
                      'body-xxs-semibold',
                      style.importedIndicator,
                    )}>
                    Imported
                  </span>
                )}
                {group.isScanned && (
                  <span
                    className={classNames(
                      'body-xxs-semibold',
                      style.scannedIndicator,
                    )}>
                    Scanned
                  </span>
                )}
              </button>
            ))}
          </section>
        ))
      )}
    </div>,
    modalRoot,
  );
};

export default RomSelect;

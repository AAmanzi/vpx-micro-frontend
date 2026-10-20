import classNames from 'classnames';
import {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import Tag, { Type as TagType } from 'src/components/Tag';
import { FileSystemItem } from 'src/types/file';
import { normalizePathForComparison } from 'src/utils';
import useClickOutside from 'src/utils/useClickOutside';
import usePickerMenuPosition from 'src/utils/usePickerMenuPosition';

import style from './BackglassPicker.module.scss';

interface Props {
  selectedBackglass: FileSystemItem | null;
  availableBackglasses: Array<FileSystemItem>;
  libraryBackglasses: Array<FileSystemItem>;
  onRemove: () => void;
  onSelect: (backglass: FileSystemItem) => void;
}

const getBackglassDisplayName = (name: string): string =>
  name.replace(/\.directb2s$/i, '');

const BackglassPicker: FunctionComponent<Props> = ({
  selectedBackglass,
  availableBackglasses,
  libraryBackglasses,
  onRemove,
  onSelect,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close, { ignoreRef: menuRef });

  const options = useMemo(() => {
    const libraryPaths = new Set(
      libraryBackglasses.map((item) => normalizePathForComparison(item.path)),
    );
    const seenPaths = new Set<string>();
    const filterUnique = (items: Array<FileSystemItem>) =>
      items.filter((item) => {
        const normalizedPath = normalizePathForComparison(item.path);
        if (seenPaths.has(normalizedPath)) {
          return false;
        }
        seenPaths.add(normalizedPath);
        return true;
      });
    const imported = filterUnique(
      availableBackglasses.filter(
        (item) => !libraryPaths.has(normalizePathForComparison(item.path)),
      ),
    );
    const library = filterUnique(libraryBackglasses);
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = (item: FileSystemItem) =>
      !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);

    return {
      imported: imported.filter(matchesQuery),
      library: library.filter(matchesQuery),
    };
  }, [availableBackglasses, libraryBackglasses, query]);

  const menuStyle = usePickerMenuPosition(
    isOpen,
    buttonRef,
    menuRef,
    options,
    close,
  );

  if (selectedBackglass) {
    return (
      <div className={style.selected}>
        <Tag icon='package' label='Backglass selected' type={TagType.purple} />
        <button
          type='button'
          className={style.removeButton}
          aria-label='Remove backglass'
          onClick={onRemove}>
          <Icon
            className='secondary-text-color'
            icon='cross'
            width={14}
            height={14}
          />
        </button>
      </div>
    );
  }

  const hasOptions =
    availableBackglasses.length > 0 || libraryBackglasses.length > 0;

  if (!hasOptions) {
    return null;
  }

  const modalRoot =
    typeof document === 'undefined' ? null : document.querySelector('#modal');

  return (
    <div className={style.picker} ref={ref}>
      <button
        ref={buttonRef}
        type='button'
        className={classNames(style.assignButton, {
          [style.open]: isOpen,
        })}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}>
        <Icon icon='package' width={10} height={10} />
        <span className='body-xs-bold'>Assign backglass</span>
        <Icon
          className={classNames(style.chevron, { [style.chevronOpen]: isOpen })}
          icon='chevron-down'
          width={10}
          height={10}
        />
      </button>
      {isOpen &&
        modalRoot &&
        createPortal(
          <div ref={menuRef} className={style.menu} style={menuStyle}>
            <div className={style.search}>
              <Input
                value={query}
                onChange={setQuery}
                icon='search'
                placeholder='Search backglasses'
                size={InputSize.small}
              />
              {query && (
                <button
                  type='button'
                  className={style.clearButton}
                  aria-label='Clear backglass search'
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setQuery('')}>
                  <Icon icon='cross' width={10} height={10} />
                </button>
              )}
            </div>
            {options.imported.length === 0 && options.library.length === 0 ? (
              <div
                className={classNames(
                  'secondary-text-color',
                  'body-sm-regular',
                  style.empty,
                )}>
                No backglasses found
              </div>
            ) : (
              <>
                {options.imported.length > 0 && (
                  <section className={style.group}>
                    <div
                      className={classNames(
                        'body-xs-semibold',
                        style.groupTitle,
                        style.imported,
                      )}>
                      Manually imported
                    </div>
                    {options.imported.map((item) => (
                      <button
                        type='button'
                        key={item.path}
                        className={style.option}
                        onClick={() => {
                          onSelect(item);
                          close();
                        }}>
                        <span className='primary-text-color body-sm-semibold'>
                          {getBackglassDisplayName(item.name)}
                        </span>
                      </button>
                    ))}
                  </section>
                )}
                {options.library.length > 0 && (
                  <section className={style.group}>
                    <div
                      className={classNames(
                        'body-xs-semibold',
                        style.groupTitle,
                        style.library,
                      )}>
                      In library
                    </div>
                    {options.library.map((item) => (
                      <button
                        type='button'
                        key={item.path}
                        className={style.option}
                        onClick={() => {
                          onSelect(item);
                          close();
                        }}>
                        <span className='primary-text-color body-sm-semibold'>
                          {getBackglassDisplayName(item.name)}
                        </span>
                      </button>
                    ))}
                  </section>
                )}
              </>
            )}
          </div>,
          modalRoot,
        )}
    </div>
  );
};

export default BackglassPicker;

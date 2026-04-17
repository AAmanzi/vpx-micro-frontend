import classNames from 'classnames';
import { FunctionComponent, useMemo, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import { ExportGroup } from 'src/types/export';
import useClickOutside from 'src/utils/useClickOutside';

import style from './ExportGroupSelect.module.scss';

const GROUP_OPTIONS: Array<{ value: ExportGroup; label: string }> = [
  { value: ExportGroup.allTables, label: 'All Tables' },
  { value: ExportGroup.favorites, label: 'Favorites' },
  { value: ExportGroup.archived, label: 'Archived' },
];

interface Props {
  value: ExportGroup;
  onChange: (value: ExportGroup) => void;
  disabled?: boolean;
}

const ExportGroupSelect: FunctionComponent<Props> = ({
  value,
  onChange,
  disabled,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedLabel = useMemo(() => {
    return (
      GROUP_OPTIONS.find((option) => option.value === value)?.label ||
      'All Tables'
    );
  }, [value]);

  const handleSelectGroup = (nextValue: ExportGroup) => () => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={style.container}>
      <p
        className={classNames(
          'body-sm-regular',
          'secondary-text-color',
          style.labelText,
        )}>
        Choose which group of tables to export
      </p>
      <div className={style.picker} ref={ref}>
        <button
          type='button'
          className={classNames(style.trigger, {
            [style.open]: isOpen,
          })}
          onClick={handleToggle}
          disabled={disabled}>
          <span className='secondary-text-color body-sm-semibold'>
            {selectedLabel}
          </span>
          <Icon
            icon='chevron-down'
            className={classNames('secondary-text-color', style.chevron, {
              [style.open]: isOpen,
            })}
            width={14}
            height={14}
          />
        </button>
        {isOpen && (
          <div className={style.dropdown}>
            {GROUP_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                className={classNames(style.option, {
                  [style.selected]: option.value === value,
                })}
                onClick={handleSelectGroup(option.value)}>
                <span className='primary-text-color body-sm-semibold'>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportGroupSelect;

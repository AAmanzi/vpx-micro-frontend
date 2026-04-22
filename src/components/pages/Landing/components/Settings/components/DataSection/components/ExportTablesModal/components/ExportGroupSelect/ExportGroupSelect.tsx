import classNames from 'classnames';
import { FunctionComponent, useMemo, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import type { Icon as IconName } from 'src/components/Icon/types';
import { GroupType } from 'src/types/table';
import useClickOutside from 'src/utils/useClickOutside';

import style from './ExportGroupSelect.module.scss';

const GROUP_OPTIONS: Array<{
  value: GroupType;
  label: string;
  icon: IconName;
}> = [
  {
    value: GroupType.allTables,
    label: 'All Tables (excluding archived)',
    icon: 'grid',
  },
  { value: GroupType.favorites, label: 'Favorites', icon: 'star' },
  {
    value: GroupType.allTablesIncludingArchived,
    label: 'All Tables (including archived)',
    icon: 'database',
  },
  { value: GroupType.archived, label: 'Archived', icon: 'archive' },
];

interface Props {
  value: GroupType;
  onChange: (value: GroupType) => void;
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

  const selectedOption = useMemo(() => {
    return (
      GROUP_OPTIONS.find((option) => option.value === value) || GROUP_OPTIONS[0]
    );
  }, [value]);

  const handleSelectGroup = (nextValue: GroupType) => () => {
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
          <span className={style.triggerContent}>
            <Icon
              icon={selectedOption.icon}
              className={classNames('secondary-text-color', style.icon)}
              width={14}
              height={14}
            />
            <span className='secondary-text-color body-sm-semibold'>
              {selectedOption.label}
            </span>
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
                <span className={style.optionContent}>
                  <Icon
                    icon={option.icon}
                    className={classNames('secondary-text-color', style.icon)}
                    width={14}
                    height={14}
                  />
                  <span className='primary-text-color body-sm-semibold'>
                    {option.label}
                  </span>
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

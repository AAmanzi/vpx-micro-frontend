import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import Icon from 'src/components/Icon';

import style from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Array<SelectOption>;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const Select: FunctionComponent<Props> = ({
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={style.wrapper}>
      <button
        type='button'
        className={classNames(style.trigger, isOpen && style.open)}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}>
        <span className='primary-text-color body-sm-regular'>
          {selected?.label}
        </span>
        <Icon
          className={classNames('secondary-text-color', style.chevron)}
          icon='chevron-down'
          width={16}
          height={16}
        />
      </button>
      {isOpen && (
        <div className={style.menu} role='listbox'>
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              role='option'
              aria-selected={option.value === value}
              className={classNames(
                style.option,
                'body-sm-regular',
                option.value === value && style.selected,
              )}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;

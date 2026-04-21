import classNames from 'classnames';
import { FunctionComponent, useMemo, useRef, useState } from 'react';

import CheckboxSwitch from 'src/components/CheckboxSwitch';
import Icon from 'src/components/Icon';
import { Order } from 'src/types/config';
import useClickOutside from 'src/utils/useClickOutside';

import style from './OrderPicker.module.scss';

const ORDER_OPTIONS: Array<{ value: Order; label: string }> = [
  { value: Order.nameAsc, label: 'Name (A-Z)' },
  { value: Order.nameDesc, label: 'Name (Z-A)' },
  { value: Order.dateAddedAsc, label: 'Oldest First' },
  { value: Order.dateAddedDesc, label: 'Newest First' },
  { value: Order.recentlyPlayed, label: 'Recent' },
  { value: Order.leastPlayed, label: 'Least Played' },
];

interface Props {
  favoritesOnTop: boolean;
  onFavoritesOnTopChange: (favoritesOnTop: boolean) => void;
  order: Order;
  onOrderChange: (order: Order) => void;
  disabled?: boolean;
}

const OrderPicker: FunctionComponent<Props> = ({
  favoritesOnTop,
  onFavoritesOnTopChange,
  order,
  onOrderChange,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedLabel = useMemo(
    () =>
      ORDER_OPTIONS.find((option) => option.value === order)?.label || 'Sort',
    [order],
  );

  const handleSelectOrder = (value: Order) => () => {
    if (disabled) {
      return;
    }

    onOrderChange(value);
    setIsOpen(false);
  };

  const handleToggleOpen = () => {
    if (disabled) {
      return;
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <div className={style.container} ref={ref}>
      <button
        type='button'
        className={classNames(style.trigger, {
          [style.open]: isOpen,
          [style.disabled]: disabled,
        })}
        onClick={handleToggleOpen}>
        <Icon
          icon='arrow-up-down'
          className='secondary-text-color'
          width={16}
          height={16}
        />
        <span
          className={classNames(
            'secondary-text-color',
            'body-md-regular',
            style.selectedLabel,
          )}>
          {selectedLabel}
        </span>
        {!disabled && (
          <Icon
            icon='chevron-down'
            className={classNames('secondary-text-color', style.chevron, {
              [style.open]: isOpen,
            })}
            width={14}
            height={14}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className={style.dropdown}>
          <div
            className={classNames(
              'secondary-text-color',
              'body-xs-semibold',
              'uppercase',
              style.title,
            )}>
            Order tables by
          </div>
          <div>
            {ORDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                className={classNames(style.option, {
                  [style.selected]: option.value === order,
                })}
                onClick={handleSelectOrder(option.value)}>
                <span className='primary-text-color body-md-semibold'>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <div className={style.switchRow}>
            <span className='secondary-text-color body-sm-regular'>
              Keep favorites on top
            </span>
            <CheckboxSwitch
              checked={favoritesOnTop}
              onChange={() => onFavoritesOnTopChange(!favoritesOnTop)}
              color='yellow'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPicker;

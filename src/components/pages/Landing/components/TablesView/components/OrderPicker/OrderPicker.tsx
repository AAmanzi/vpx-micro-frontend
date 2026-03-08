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
  { value: Order.recentlyPlayed, label: 'Recently Played' },
  { value: Order.leastPlayed, label: 'Least Played' },
];

interface Props {
  favoritesOnTop: boolean;
  onFavoritesOnTopChange: (favoritesOnTop: boolean) => void;
  order: Order;
  onOrderChange: (order: Order) => void;
}

const OrderPicker: FunctionComponent<Props> = ({
  favoritesOnTop,
  onFavoritesOnTopChange,
  order,
  onOrderChange,
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
    onOrderChange(value);
    setIsOpen(false);
  };

  return (
    <div className={style.container} ref={ref}>
      <button
        type='button'
        className={classNames(style.trigger, {
          [style.open]: isOpen,
        })}
        onClick={() => setIsOpen((prev) => !prev)}>
        <Icon
          icon='arrow-up-down'
          className='secondary-text-color'
          width={16}
          height={16}
        />
        <span
          className={classNames(
            'secondary-text-color',
            'caption-big-regular',
            style.selectedLabel,
          )}>
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
          <div
            className={classNames(
              'secondary-text-color',
              'caption-small-semibold',
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
                <span className='primary-text-color caption-big-semibold'>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <div className={style.switchRow}>
            <span className='secondary-text-color caption-medium-regular'>
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

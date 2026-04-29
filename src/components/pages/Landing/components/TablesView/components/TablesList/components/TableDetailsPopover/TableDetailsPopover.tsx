import classNames from 'classnames';
import { FunctionComponent, useRef, useState } from 'react';

import Icon from 'src/components/Icon';
import { displayDate } from 'src/utils';
import useClickOutside from 'src/utils/useClickOutside';

import style from './TableDetailsPopover.module.scss';

interface Props {
  vpxFile: string;
  romFile?: string;
  dateAddedTimestamp: number;
  triggerClassName?: string;
}

const TableDetailsPopover: FunctionComponent<Props> = ({
  vpxFile,
  romFile,
  dateAddedTimestamp,
  triggerClassName,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = isHovered || isPinned;

  useClickOutside(containerRef, () => {
    setIsPinned(false);
  });

  const handleTriggerClick = () => {
    setIsPinned((currentValue) => !currentValue);
  };

  return (
    <div
      ref={containerRef}
      className={style.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <button
        type='button'
        aria-expanded={isOpen}
        aria-label='Show table details'
        className={classNames(
          'secondary-text-color',
          'body-xs-semibold',
          style.trigger,
          triggerClassName,
        )}
        onClick={handleTriggerClick}>
        <Icon
          icon='circle-info'
          width={16}
          height={16}
          className={style.triggerIcon}
        />
      </button>

      <div
        className={classNames(style.popover, {
          [style.isOpen]: isOpen,
        })}>
        <div className={style.row}>
          <span
            className={classNames('secondary-text-color', 'body-xs-semibold')}>
            File:
          </span>
          <p
            className={classNames(
              'primary-text-color',
              'body-xs-semibold',
              style.value,
            )}>
            {vpxFile}
          </p>
        </div>

        {romFile && (
          <div className={style.row}>
            <span
              className={classNames(
                'secondary-text-color',
                'body-xs-semibold',
              )}>
              ROM:
            </span>
            <p
              className={classNames(
                'primary-text-color',
                'body-xs-semibold',
                style.value,
              )}>
              {romFile}
            </p>
          </div>
        )}

        <div className={style.row}>
          <span
            className={classNames('secondary-text-color', 'body-xs-semibold')}>
            Added:
          </span>
          <p
            className={classNames(
              'primary-text-color',
              'body-xs-semibold',
              style.value,
            )}>
            {displayDate(dateAddedTimestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableDetailsPopover;

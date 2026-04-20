import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';
import { Icon as IconType } from 'src/components/Icon/types';

import style from './SectionHeader.module.scss';

interface Props {
  title: string;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  color: 'yellow' | 'blue' | 'red';
  warningIcon?: IconType;
  warningText?: string;
}

const SectionHeader: FunctionComponent<Props> = ({
  color,
  onDeselectAll,
  onSelectAll,
  title,
  warningIcon,
  warningText,
}) => {
  return (
    <div
      className={classNames(style.container, {
        [style.yellow]: color === 'yellow',
        [style.blue]: color === 'blue',
        [style.red]: color === 'red',
      })}>
      {warningText && (
        <div className={style.warning}>
          {warningIcon && (
            <Icon
              className={style.icon}
              icon={warningIcon}
              width={16}
              height={16}
            />
          )}
          <span className={classNames('body-sm-regular', style.warningText)}>
            {warningText}
          </span>
        </div>
      )}
      <div className={style.content}>
        <div className='secondary-text-color body-sm-regular'>{title}</div>
        <div className={style.actions}>
          <button
            type='button'
            onClick={onSelectAll}
            className={classNames('body-sm-regular', style.selectAllButton)}>
            Select All
          </button>
          <div className={style.spacer} />
          <button
            type='button'
            onClick={onDeselectAll}
            className={classNames(
              'body-sm-regular',
              'primary-text-color',
              style.deselectAllButton,
            )}>
            Deselect All
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;

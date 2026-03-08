import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';

import Icon from 'src/components/Icon';
import { Icon as IconType } from 'src/components/Icon/types';

import style from './Collapsible.module.scss';

interface Props {
  title: string;
  description: string;
  icon: IconType;
  color: 'yellow' | 'blue' | 'red';
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const Collapsible: FunctionComponent<Props> = ({
  title,
  description,
  icon,
  color,
  count,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <section className={classNames(style.container, style[color])}>
      <button type='button' className={style.header} onClick={onToggle}>
        <div className={style.iconWrapper}>
          <Icon icon={icon} className={classNames(style.icon)} />
        </div>
        <div className={style.titleWrapper}>
          <h4
            className={classNames(
              'primary-text-color',
              'body-sm-semibold',
            )}>
            {title}
          </h4>
          <p className='secondary-text-color body-xs-regular'>
            {description}
          </p>
        </div>
        <div className={style.countAndChevronWrapper}>
          <div className={classNames('body-sm-bold', style.count)}>
            {count}
          </div>
          <Icon
            icon='chevron-right'
            className={classNames('secondary-text-color', style.chevron, {
              [style.open]: isOpen,
            })}
            width={14}
            height={14}
          />
        </div>
      </button>
      {isOpen && <div className={style.content}>{children}</div>}
    </section>
  );
};

export default Collapsible;

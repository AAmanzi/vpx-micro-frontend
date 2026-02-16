import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from '../Icon';
import style from './Button.module.scss';
import { Props, Size, Type } from './types';

const Button: FunctionComponent<Props> = ({
  label,
  onClick,
  disabled = false,
  type = Type.primary,
  icon,
  size = Size.medium,
  fill,
  circle,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const content = (
    <div
      className={classNames(style.content, {
        [style.primary]: type === Type.primary,
        [style.secondary]: type === Type.secondary,
        [style.small]: size === Size.small,
        [style.medium]: size === Size.medium,
        [style.large]: size === Size.large,
        [style.circle]: circle,
      })}>
      {icon && (
        <div className={style.iconWrapper}>
          <Icon icon={icon} className={style.icon} />
        </div>
      )}
      <span className={classNames('button-text-16', 'primary-text-color')}>
        {label}
      </span>
    </div>
  );

  return (
    <button
      type='button'
      className={classNames(style.container, {
        [style.disabled]: disabled,
        [style.fill]: fill,
      })}
      onClick={handleClick}
      disabled={disabled}>
      {content}
    </button>
  );
};

export default Button;

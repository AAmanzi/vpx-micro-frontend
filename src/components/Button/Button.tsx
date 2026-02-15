import classNames from 'classnames';
import { FunctionComponent } from 'react';

import style from './Button.module.scss';
import { Props, Type } from './types';

const Button: FunctionComponent<Props> = ({
  label,
  onClick,
  disabled = false,
  type = Type.primary,
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
      })}>
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
      })}
      onClick={handleClick}
      disabled={disabled}>
      {content}
    </button>
  );
};

export default Button;

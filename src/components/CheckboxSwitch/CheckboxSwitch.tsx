import classNames from 'classnames';
import { FunctionComponent } from 'react';

import style from './CheckboxSwitch.module.scss';
import { Props } from './types';

const CheckboxSwitch: FunctionComponent<Props> = ({
  checked,
  onChange,
  disabled = false,
  showDisabled = false,
  color = 'blue',
}) => {
  const handleChange = () => {
    if (disabled) {
      return;
    }

    onChange();
  };

  const colorClassName = style[color];

  return (
    <label
      className={classNames(
        style.container,
        {
          [style.disabled]: disabled,
        },
        colorClassName,
      )}>
      <input
        type='checkbox'
        checked={checked}
        onChange={handleChange}
        className={classNames(style.checkbox, {
          [style.showDisabled]: showDisabled,
        })}
        disabled={disabled}
        role='switch'
        aria-checked={checked}
      />
      <div className={style.slider} />
      <div className={style.circle} />
    </label>
  );
};

export default CheckboxSwitch;

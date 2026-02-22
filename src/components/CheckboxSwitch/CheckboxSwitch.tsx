import { FunctionComponent } from 'react';
import classNames from 'classnames';

import { Props } from './types';
import style from './CheckboxSwitch.module.scss';

const CheckboxSwitch: FunctionComponent<Props> = ({
  checked,
  onChange,
  disabled = false,
  showDisabled = false,
}) => {
  const handleChange = () => {
    if (onChange && !disabled) {
      onChange();
    }
  };

  return (
    <label
      className={classNames(style.container, {
        [style.disabled]: disabled,
      })}>
      <input
        type='checkbox'
        checked={checked}
        onChange={handleChange}
        className={classNames(style.checkbox, {
          [style.showDisabled]: showDisabled,
        })}
        disabled={disabled}
      />
      <div className={style.slider} />
      <div className={style.circle} />
    </label>
  );
};

export default CheckboxSwitch;

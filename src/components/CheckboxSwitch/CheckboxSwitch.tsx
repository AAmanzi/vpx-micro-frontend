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
    if (onChange && !disabled) {
      onChange();
    }
  };

  return (
    <label
      className={classNames(style.container, {
        [style.disabled]: disabled,
        [style.blue]: color === 'blue',
        [style.red]: color === 'red',
        [style.green]: color === 'green',
        [style.yellow]: color === 'yellow',
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

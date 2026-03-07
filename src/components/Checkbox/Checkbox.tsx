import classNames from 'classnames';
import { FunctionComponent } from 'react';

import style from './Checkbox.module.scss';
import { Props } from './types';

const Checkbox: FunctionComponent<Props> = ({ checked, onChange, color }) => {
  const handleChange = () => {
    onChange();
  };

  return (
    <input
      type='checkbox'
      checked={checked}
      onChange={handleChange}
      className={classNames(style.checkbox, {
        [style.blue]: color === 'blue',
        [style.red]: color === 'red',
        [style.green]: color === 'green',
        [style.yellow]: color === 'yellow',
      })}
    />
  );
};

export default Checkbox;

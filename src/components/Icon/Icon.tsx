import classNames from 'classnames';
import { FunctionComponent } from 'react';

import style from './Icon.module.scss';
import { Props } from './types';

const Icon: FunctionComponent<Props> = ({ icon, width, height, className }) => {
  return (
    <svg
      width={width || 18}
      height={height || 18}
      className={classNames(style.icon, style[`icon-${icon}`], className)}>
      <use href={`/icons.svg#icon-${icon}`} />
    </svg>
  );
};

export default Icon;

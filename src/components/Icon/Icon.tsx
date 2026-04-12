import classNames from 'classnames';
import { FunctionComponent } from 'react';

import style from './Icon.module.scss';
import { Props } from './types';

const Icon: FunctionComponent<Props> = ({ icon, width, height, className }) => {
  const spritePath = `./icons.svg#icon-${icon}`;

  return (
    <svg
      width={width || 18}
      height={height || 18}
      className={classNames(style.icon, style[`icon-${icon}`], className)}>
      <use href={spritePath} />
    </svg>
  );
};

export default Icon;

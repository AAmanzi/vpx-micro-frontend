import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from '../Icon';
import style from './Tag.module.scss';
import { Props, Type } from './types';

const Tag: FunctionComponent<Props> = ({ label, icon, type = Type.info }) => {
  return (
    <div
      className={classNames(style.container, {
        [style.info]: type === Type.info,
        [style.success]: type === Type.success,
        [style.warning]: type === Type.warning,
      })}>
      {icon && <Icon icon={icon} width={10} height={10} />}
      <span className='caption-small-bold'>{label}</span>
    </div>
  );
};

export default Tag;

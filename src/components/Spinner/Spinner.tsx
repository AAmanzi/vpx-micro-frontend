import { FunctionComponent } from 'react';

import style from './Spinner.module.scss';

interface Props {
  size?: number;
}

const Spinner: FunctionComponent<Props> = ({ size = 64 }) => {
  return (
    <div className={style.spinner} style={{ width: size, height: size }}></div>
  );
};

export default Spinner;

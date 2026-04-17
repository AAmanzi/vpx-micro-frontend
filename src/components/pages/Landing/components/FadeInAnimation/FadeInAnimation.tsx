import { FunctionComponent, ReactNode } from 'react';

import style from './FadeInAnimation.module.scss';

interface Props {
  animationKey: string | number;
  children: ReactNode;
}

const FadeInAnimation: FunctionComponent<Props> = ({
  animationKey,
  children,
}) => {
  return (
    <div key={animationKey} className={style.content}>
      {children}
    </div>
  );
};

export default FadeInAnimation;

import classNames from 'classnames';
import { FunctionComponent, ReactNode, useId } from 'react';

import style from './Tooltip.module.scss';

type Placement = 'top-start' | 'top-end';

type Props = {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  placement?: Placement;
};

const Tooltip: FunctionComponent<Props> = ({
  children,
  className,
  content,
  placement = 'top-start',
}) => {
  const tooltipId = useId();

  return (
    <span
      className={classNames(
        style.wrapper,
        placement === 'top-end' ? style.topEnd : style.topStart,
        className,
      )}
      tabIndex={0}
      aria-describedby={tooltipId}>
      {children}
      <span
        id={tooltipId}
        className={classNames('body-xs-regular', style.tooltip)}
        role='tooltip'>
        {content}
      </span>
    </span>
  );
};

export default Tooltip;

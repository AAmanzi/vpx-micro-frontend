import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import Icon from '../Icon';
import { Icon as IconType } from '../Icon/types';
import style from './Toast.module.scss';
import { Props, Type } from './types';

const expiryTime = 3000;

const Toast: FunctionComponent<Props> = ({
  message,
  type = Type.warning,
  isOpen,
  close,
}) => {
  const timeoutId = useRef<number>();
  const startTime = useRef(0);
  const remainingTime = useRef(0);

  const [hasTransition, setHasTransition] = useState(true);

  const startTimer = () => {
    if (!isOpen) {
      return;
    }

    startTime.current = Date.now();
    // timeoutId.current = window.setTimeout(close, remainingTime.current);
  };

  const pauseTimer = () => {
    window.clearTimeout(timeoutId.current);

    const elapsedTime = Date.now() - startTime.current;

    remainingTime.current -= elapsedTime;
  };

  const handleMouseEnter = () => {
    pauseTimer();
  };

  useEffect(() => {
    if (isOpen) {
      remainingTime.current = expiryTime;

      startTimer();
    } else {
      window.clearTimeout(timeoutId.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHasTransition(true);
    }
  }, [isOpen]);

  const getTitle = (): string => {
    switch (type) {
      case Type.success:
        return 'Success';
      case Type.error:
        return 'Error';
      case Type.warning:
        return 'Warning';
    }
  };

  const getIcon = (): IconType => {
    switch (type) {
      case Type.success:
        return 'circle-checkmark';
      case Type.error:
        return 'circle-cross';
      case Type.warning:
        return 'triangle-alert';
    }
  };

  return (
    <div
      className={classNames(style.container, {
        [style.open]: isOpen,
        [style.transition]: hasTransition,
        [style.success]: type === Type.success,
        [style.error]: type === Type.error,
        [style.warning]: type === Type.warning,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={startTimer}
      onTouchEnd={startTimer}>
      <div className={style.iconWrapper}>
        <Icon icon={getIcon()} className={style.icon} />
      </div>
      <div>
        <div
          className={classNames('primary-text-color', 'caption-medium-bold')}>
          {getTitle()}
        </div>
        <div className='secondary-text-color caption-small-semibold'>
          {message}
        </div>
      </div>
      <button type='button' className={style.closeButton} onClick={close}>
        <Icon
          icon='cross'
          className='secondary-text-color'
          width={14}
          height={14}
        />
      </button>
    </div>
  );
};

export default Toast;

import classNames from 'classnames';
import {
  FunctionComponent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Button, { Type as ButtonType } from 'src/components/Button';

import style from './Modal.module.scss';
import { Props } from './types';

const Modal: FunctionComponent<Props> = ({
  modalClassName,
  title,
  titleClassName,
  description,
  onExitClick,
  showExitButton = true,
  buttonType = ButtonType.primary,
  headerClassName,
  allowOverflow = false,
  children,
}) => {
  const ref = useRef<Element | null>(null);
  const scrollPosition = useRef<number | null>(null);
  const didManipulateBody = useRef<boolean>(false);
  const previousBodyStyle = useRef<{
    // TODO zaminit ovo sa cssText ali kad se rijese modali
    touchAction: string | undefined;
    overflowY: string | undefined;
  } | null>(null);
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((tick) => tick + 1);

  useEffect(() => {
    ref.current = document.querySelector('#modal') || null;

    if (ref.current?.childElementCount === 0) {
      didManipulateBody.current = true;
      previousBodyStyle.current = {
        touchAction: document.body.style.touchAction,
        overflowY: document.body.style.overflowY,
      };

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.width = '100%';

      scrollPosition.current = window.pageYOffset;

      if (scrollPosition.current !== null) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition.current}px`;
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onExitClick) {
        onExitClick();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    if (ref.current) {
      forceUpdate();
    }

    return () => {
      if (didManipulateBody.current) {
        document.body.style.removeProperty('overflow');

        document.body.style.removeProperty('width');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');

        if (previousBodyStyle.current?.touchAction) {
          document.body.style.touchAction =
            previousBodyStyle.current.touchAction;
        } else {
          document.body.style.removeProperty('touch-action');
        }

        if (previousBodyStyle.current?.overflowY) {
          document.body.style.overflowY = previousBodyStyle.current.overflowY;
        }

        if (scrollPosition.current && document.scrollingElement) {
          const htmlStyle = document.documentElement.style;

          document.documentElement.style.scrollBehavior = 'unset';
          window.scrollTo(0, scrollPosition.current);
          document.documentElement.style.scrollBehavior =
            htmlStyle.scrollBehavior || 'auto';
        }
      }

      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const stopBubbling = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleOutsideClick = () => {
    if (onExitClick) {
      onExitClick();
    }
  };

  const hasHeader = title || (onExitClick && showExitButton);
  const hasBorder = title !== undefined || description !== undefined;

  const getModal = () => {
    const content = (
      <div
        className={classNames(style.innerWrapper, {
          [style.allowOverflow]: allowOverflow,
        })}>
        <div
          className={classNames(style.modal, modalClassName)}
          onClick={stopBubbling}>
          {hasHeader && (
            <div
              className={classNames(style.headerWrapper, headerClassName, {
                [style.hasBorder]: hasBorder,
              })}>
              <div className={style.titleAndDesctiptionWrapper}>
                {title && (
                  <h2
                    className={classNames(
                      'title-h4-bold',
                      'primary-text-color',
                      titleClassName,
                    )}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    className={classNames(
                      'caption-big-semibold',
                      'secondary-text-color',
                    )}>
                    {description}
                  </p>
                )}
              </div>

              {onExitClick && showExitButton && (
                <div className={style.exitButtonWrapper}>
                  <Button
                    label='close'
                    onClick={onExitClick}
                    type={buttonType}
                  />
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    );

    return (
      <div className={style.outerWrapper} onClick={handleOutsideClick}>
        {content}
      </div>
    );
  };

  return ref.current ? createPortal(getModal(), ref.current) : null;
};

export default Modal;

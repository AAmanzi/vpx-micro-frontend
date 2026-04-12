import classNames from 'classnames';
import { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from 'src/components/Icon';

import style from './Modal.module.scss';
import { Props, Size } from './types';

const Modal: FunctionComponent<Props> = ({
  modalClassName,
  title,
  titleClassName,
  description,
  onExitClick,
  showExitButton = true,
  headerClassName,
  allowOverflow = false,
  children,
  size = Size.medium,
  color,
}) => {
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  useEffect(() => {
    setPortalRoot(document.querySelector('#modal'));
  }, []);

  useEffect(() => {
    if (!portalRoot) {
      return;
    }

    const shouldLockBody = portalRoot.childElementCount === 1;
    const bodyStyle = document.body.style;
    const previousBodyStyle = {
      overflow: bodyStyle.overflow,
      touchAction: bodyStyle.touchAction,
      width: bodyStyle.width,
      position: bodyStyle.position,
      top: bodyStyle.top,
    };
    const scrollPosition = window.pageYOffset;

    if (shouldLockBody) {
      bodyStyle.overflow = 'hidden';
      bodyStyle.touchAction = 'none';
      bodyStyle.width = '100%';
      bodyStyle.position = 'fixed';
      bodyStyle.top = `-${scrollPosition}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onExitClick) {
        onExitClick();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (shouldLockBody) {
        bodyStyle.overflow = previousBodyStyle.overflow;
        bodyStyle.touchAction = previousBodyStyle.touchAction;
        bodyStyle.width = previousBodyStyle.width;
        bodyStyle.position = previousBodyStyle.position;
        bodyStyle.top = previousBodyStyle.top;

        window.scrollTo(0, scrollPosition);
      }

      window.removeEventListener('keydown', onKeyDown);
    };
  }, [portalRoot, onExitClick]);

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
  const sizeClassName = style[size];
  const colorClassName = color ? style[color] : undefined;

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div className={style.outerWrapper} onClick={handleOutsideClick}>
      <div
        className={classNames(style.innerWrapper, {
          [style.allowOverflow]: allowOverflow,
        })}>
        <div
          className={classNames(
            style.modal,
            modalClassName,
            sizeClassName,
            colorClassName,
          )}
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
                      'heading-6-bold',
                      'primary-text-color',
                      titleClassName,
                    )}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    className={classNames(
                      'body-xs-regular',
                      'secondary-text-color',
                    )}>
                    {description}
                  </p>
                )}
              </div>

              {onExitClick && showExitButton && (
                <div className={style.exitButtonWrapper}>
                  <button
                    className={style.exitButton}
                    type='button'
                    onClick={onExitClick}>
                    <Icon
                      className='secondary-text-color'
                      icon='cross'
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>,
    portalRoot,
  );
};

export default Modal;

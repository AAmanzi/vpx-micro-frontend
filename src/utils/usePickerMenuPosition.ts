import { CSSProperties, RefObject, useLayoutEffect, useState } from 'react';

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const usePickerMenuPosition = (
  isOpen: boolean,
  buttonRef: RefObject<HTMLButtonElement>,
  menuRef: RefObject<HTMLDivElement>,
  content: unknown,
  onClose: () => void,
): CSSProperties => {
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) {
        return;
      }

      const buttonBounds = button.getBoundingClientRect();
      const edgePadding = 16;
      const menuGap = 8;
      const modalBounds = button
        .closest('[data-modal-container]')
        ?.getBoundingClientRect();
      const bounds = {
        top: Math.max(0, modalBounds?.top ?? 0),
        right: Math.min(
          window.innerWidth,
          modalBounds?.right ?? window.innerWidth,
        ),
        bottom: Math.min(
          window.innerHeight,
          modalBounds?.bottom ?? window.innerHeight,
        ),
        left: Math.max(0, modalBounds?.left ?? 0),
      };
      const visibleBounds = { ...bounds };
      let ancestor = button.parentElement;
      while (ancestor) {
        const style = window.getComputedStyle(ancestor);
        const clipsX = /auto|scroll|hidden|clip|overlay/.test(style.overflowX);
        const clipsY = /auto|scroll|hidden|clip|overlay/.test(style.overflowY);
        if (clipsX || clipsY) {
          const ancestorBounds = ancestor.getBoundingClientRect();
          const top = ancestorBounds.top + ancestor.clientTop;
          const left = ancestorBounds.left + ancestor.clientLeft;
          if (clipsX) {
            visibleBounds.left = Math.max(visibleBounds.left, left);
            visibleBounds.right = Math.min(
              visibleBounds.right,
              left + ancestor.clientWidth,
            );
          }
          if (clipsY) {
            visibleBounds.top = Math.max(visibleBounds.top, top);
            visibleBounds.bottom = Math.min(
              visibleBounds.bottom,
              top + ancestor.clientHeight,
            );
          }
        }
        ancestor = ancestor.parentElement;
      }
      if (
        visibleBounds.bottom <= visibleBounds.top ||
        visibleBounds.right <= visibleBounds.left ||
        buttonBounds.bottom <= visibleBounds.top ||
        buttonBounds.top >= visibleBounds.bottom ||
        buttonBounds.right <= visibleBounds.left ||
        buttonBounds.left >= visibleBounds.right ||
        bounds.right - bounds.left <= edgePadding * 2 ||
        bounds.bottom - bounds.top <= edgePadding * 2
      ) {
        setPosition(null);
        onClose();
        return;
      }
      const width = Math.max(
        0,
        Math.min(254, bounds.right - bounds.left - edgePadding * 2),
      );
      menu.style.width = `${width}px`;
      const contentHeight =
        menu.scrollHeight + menu.offsetHeight - menu.clientHeight;
      const maxHeight = Math.min(
        420,
        window.innerHeight * 0.7,
        bounds.bottom - bounds.top - edgePadding * 2,
      );
      const availableBelow =
        bounds.bottom - buttonBounds.bottom - menuGap - edgePadding;
      const availableAbove =
        buttonBounds.top - bounds.top - menuGap - edgePadding;
      const openAbove =
        availableBelow < Math.min(contentHeight, maxHeight) &&
        availableAbove > availableBelow;
      const availableHeight = openAbove ? availableAbove : availableBelow;
      const height = Math.max(
        0,
        Math.min(contentHeight, maxHeight, availableHeight),
      );
      const desiredTop = openAbove
        ? buttonBounds.top - menuGap - height
        : buttonBounds.bottom + menuGap;
      const top = Math.max(
        bounds.top + edgePadding,
        Math.min(desiredTop, bounds.bottom - edgePadding - height),
      );
      const left = Math.max(
        bounds.left + edgePadding,
        Math.min(buttonBounds.left, bounds.right - edgePadding - width),
      );

      setPosition((previous) =>
        previous?.top === top &&
        previous.left === left &&
        previous.width === width &&
        previous.maxHeight === height
          ? previous
          : { top, left, width, maxHeight: height },
      );
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const observer = new ResizeObserver(updatePosition);
    if (menuRef.current) {
      observer.observe(menuRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, buttonRef, menuRef, content, onClose]);

  return {
    top: position?.top,
    left: position?.left,
    width: position?.width ?? 254,
    maxHeight: position?.maxHeight,
    visibility: position ? 'visible' : 'hidden',
  };
};

export default usePickerMenuPosition;

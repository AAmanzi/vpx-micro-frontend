import { RefObject, useEffect } from 'react';

interface Options {
  ignoreSelector?: string;
  ignoreRef?: RefObject<HTMLElement>;
}

const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  onOutsideClick: () => void,
  options: Options = {},
) => {
  const { ignoreSelector, ignoreRef } = options;

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (event.target === null) {
        return;
      }

      const targetElement =
        event.target instanceof Element ? event.target : null;

      if (ignoreSelector && targetElement?.closest(ignoreSelector)) {
        return;
      }

      if (ignoreRef?.current?.contains(event.target as Node)) {
        return;
      }

      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClick, true);

    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [ignoreSelector, ignoreRef, onOutsideClick, ref]);
};

export default useClickOutside;

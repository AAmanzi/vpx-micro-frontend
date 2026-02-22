import { RefObject, useEffect } from 'react';

interface Options {
  ignoreSelector?: string;
}

const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  onOutsideClick: () => void,
  options: Options = {},
) => {
  const { ignoreSelector } = options;

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

      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ignoreSelector, onOutsideClick, ref]);
};

export default useClickOutside;
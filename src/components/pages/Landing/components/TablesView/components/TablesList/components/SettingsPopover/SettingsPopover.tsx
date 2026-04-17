import {
  CSSProperties,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Icon from 'src/components/Icon';

import Settings from '../Settings';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  romFilePath?: string;
  vpxExecutablePath?: string;
  isArchived?: boolean;
  vpxFile: string;
  vpxFilePath: string;
  triggerClassName?: string;
}

const GUTTER_PX = 8;
const GAP_PX = 8;

const SettingsPopover: FunctionComponent<Props> = ({
  id,
  name,
  romFile,
  romFilePath,
  vpxExecutablePath,
  isArchived,
  vpxFile,
  vpxFilePath,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
    visibility: 'hidden',
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    const anchor =
      (trigger?.offsetParent as HTMLElement | null) || trigger?.parentElement;

    if (!trigger || !menu || !anchor) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    const spaceAbove = triggerRect.top - GUTTER_PX;
    const spaceBelow = window.innerHeight - triggerRect.bottom - GUTTER_PX;

    let topViewport = triggerRect.top - menuRect.height - GAP_PX;

    if (spaceAbove < menuRect.height && spaceBelow >= menuRect.height) {
      topViewport = triggerRect.bottom + GAP_PX;
    }

    if (spaceAbove < menuRect.height && spaceBelow < menuRect.height) {
      topViewport = Math.max(
        GUTTER_PX,
        Math.min(
          triggerRect.bottom + GAP_PX,
          window.innerHeight - menuRect.height - GUTTER_PX,
        ),
      );
    }

    const unclampedLeft = triggerRect.right - menuRect.width;
    const leftViewport = Math.max(
      GUTTER_PX,
      Math.min(unclampedLeft, window.innerWidth - menuRect.width - GUTTER_PX),
    );

    setPosition({
      position: 'absolute',
      top: topViewport - anchorRect.top,
      left: leftViewport - anchorRect.left,
      zIndex: 20,
      visibility: 'visible',
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(updatePosition);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setPosition((current) => ({ ...current, visibility: 'hidden' }));
      }

      return !prev;
    });
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        className={triggerClassName}
        onClick={handleToggle}>
        <Icon className='secondary-text-color' icon='kebab' />
      </button>

      {isOpen && (
        <div ref={menuRef} style={position}>
          <Settings
            id={id}
            name={name}
            romFile={romFile}
            romFilePath={romFilePath}
            vpxExecutablePath={vpxExecutablePath}
            isArchived={isArchived}
            vpxFile={vpxFile}
            vpxFilePath={vpxFilePath}
            close={close}
          />
        </div>
      )}
    </>
  );
};

export default SettingsPopover;

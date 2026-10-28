import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import CheckboxSwitch from 'src/components/CheckboxSwitch';
import Icon from 'src/components/Icon';
import { GridCardSize, GridSettings } from 'src/types/config';
import useClickOutside from 'src/utils/useClickOutside';

import style from './GridSettingsPopover.module.scss';

interface Props {
  settings: GridSettings;
  onChange: (settings: Partial<GridSettings>) => Promise<void>;
}

const cardSizes: Array<{ value: GridCardSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const GridSettingsPopover: FunctionComponent<Props> = ({
  settings,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLElement | null>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen || !popoverRef.current || !triggerRef.current) {
      return;
    }

    const updatePopoverPosition = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;

      if (!trigger || !popover) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 12;
      const preferredLeft =
        triggerRect.right - popoverRect.width - viewportPadding;
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - popoverRect.width - viewportPadding,
      );
      const left = Math.min(Math.max(preferredLeft, viewportPadding), maxLeft);
      const preferredTop = triggerRect.bottom + gap;
      const maxTop = Math.max(
        viewportPadding,
        window.innerHeight - popoverRect.height - viewportPadding,
      );
      const roomBelow =
        window.innerHeight - triggerRect.bottom - gap - viewportPadding;
      const roomAbove = triggerRect.top - gap - viewportPadding;
      const preferredVerticalPosition =
        popoverRect.height <= roomBelow
          ? preferredTop
          : popoverRect.height <= roomAbove
            ? triggerRect.top - popoverRect.height - gap
            : roomBelow >= roomAbove
              ? preferredTop
              : triggerRect.top - popoverRect.height - gap;
      const top = Math.min(
        Math.max(preferredVerticalPosition, viewportPadding),
        maxTop,
      );

      setPopoverPosition({ left, top });
    };

    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={style.container} ref={containerRef}>
      <button
        ref={triggerRef}
        type='button'
        className={classNames(style.trigger, { [style.active]: isOpen })}
        aria-label='Grid settings'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-controls='grid-settings-popover'
        title='Grid settings'
        onClick={() => setIsOpen((open) => !open)}>
        <Icon icon='sliders' width={18} height={18} />
      </button>
      {isOpen && (
        <section
          ref={popoverRef}
          id='grid-settings-popover'
          className={style.popover}
          style={{
            left: popoverPosition?.left ?? 0,
            top: popoverPosition?.top ?? 0,
            visibility: popoverPosition ? 'visible' : 'hidden',
          }}
          role='dialog'
          aria-label='Grid Settings'>
          <div className={style.heading}>
            <div className={style.headingTitle}>
              <Icon icon='grid' width={16} height={16} />
              <h2 className='body-md-semibold'>Grid Settings</h2>
            </div>
            <Icon
              icon='sliders'
              className={style.secondaryIcon}
              width={16}
              height={16}
            />
          </div>

          <div className={style.section}>
            <h3 className='body-sm-semibold'>Card size</h3>
            <div
              className={style.segments}
              role='radiogroup'
              aria-label='Card size'>
              {cardSizes.map(({ value, label }) => (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={settings.cardSize === value}
                  className={classNames(
                    style.segment,
                    {
                      [style.selected]: settings.cardSize === value,
                    },
                    'body-sm-semibold',
                  )}
                  onClick={() => void onChange({ cardSize: value })}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={style.section}>
            <h3 className='body-sm-semibold'>Visible details</h3>
            <div className={style.toggles}>
              <div className={style.toggleRow}>
                <CheckboxSwitch
                  checked={settings.showVpxFilename}
                  ariaLabel='Show VPX filename'
                  label='VPX filename'
                  labelClassName={classNames(
                    'body-sm-regular',
                    style.toggleLabel,
                  )}
                  onChange={() =>
                    void onChange({
                      showVpxFilename: !settings.showVpxFilename,
                    })
                  }
                />
              </div>
              <div className={style.toggleRow}>
                <CheckboxSwitch
                  checked={settings.showRom}
                  ariaLabel='Show ROM and backglass indicators'
                  label='ROM & backglass indicators'
                  labelClassName={classNames(
                    'body-sm-regular',
                    style.toggleLabel,
                  )}
                  onChange={() => void onChange({ showRom: !settings.showRom })}
                />
              </div>
              <div className={style.toggleRow}>
                <CheckboxSwitch
                  checked={settings.showDates}
                  ariaLabel='Show added and last played dates'
                  label='Added / Last played'
                  labelClassName={classNames(
                    'body-sm-regular',
                    style.toggleLabel,
                  )}
                  onChange={() =>
                    void onChange({ showDates: !settings.showDates })
                  }
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default GridSettingsPopover;

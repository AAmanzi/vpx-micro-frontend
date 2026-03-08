import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Icon from 'src/components/Icon';
import { Icon as IconType } from 'src/components/Icon/types';
import Input from 'src/components/Input';

import style from './LockedSetting.module.scss';

interface Props {
  label: string;
  value: string;
  defaultValue: string;
  onSave: (value: string) => void;
  lockedNote?: string;
  lockedNoteIcon?: IconType;
}

const LockedSetting: FunctionComponent<Props> = ({
  label,
  value: savedValue,
  defaultValue,
  onSave,
  lockedNote,
  lockedNoteIcon,
}) => {
  const [isLocked, setIsLocked] = useState(!Boolean(savedValue));
  const [editValue, setEditValue] = useState(savedValue);

  useEffect(() => {
    setEditValue(savedValue);
  }, [savedValue]);

  const handleToggleLock = () => {
    setEditValue(defaultValue);

    setIsLocked((prev) => {
      const newIsLocked = !prev;

      if (newIsLocked) {
        onSave('');
      } else {
        onSave(defaultValue);
      }

      return newIsLocked;
    });
  };

  const handleBlur = () => {
    if (!isLocked) {
      onSave(editValue);
    }
  };

  const displayValue = isLocked ? defaultValue : editValue;

  return (
    <div
      className={classNames(style.container, {
        [style.unlocked]: !isLocked,
      })}>
      <div className={style.header}>
        <span
          className={classNames(
            'body-sm-regular',
            'secondary-text-color',
          )}>
          {label}
        </span>
        <button
          type='button'
          className={classNames(style.lockButton, {
            [style.unlocked]: !isLocked,
          })}
          onClick={handleToggleLock}
          title={isLocked ? 'Unlock to edit' : 'Lock to save'}>
          <Icon
            icon={isLocked ? 'locked' : 'unlocked'}
            width={14}
            height={14}
          />
        </button>
      </div>
      <Input
        readonly={isLocked}
        value={displayValue}
        onChange={setEditValue}
        onBlur={handleBlur}
      />
      {isLocked && lockedNote && (
        <div className={style.lockedNote}>
          {lockedNoteIcon && (
            <Icon
              icon={lockedNoteIcon}
              width={10}
              height={10}
              className='secondary-text-color'
            />
          )}
          <span className='body-xs-regular secondary-text-color'>
            <i>{lockedNote}</i>
          </span>
        </div>
      )}
    </div>
  );
};

export default LockedSetting;

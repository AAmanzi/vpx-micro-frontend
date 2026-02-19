import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Icon from 'src/components/Icon';
import Input from 'src/components/Input';

import style from './LockedSetting.module.scss';

interface Props {
  label: string;
  value: string;
  defaultValue: string;
  onSave: (value: string) => void;
}

const LockedSetting: FunctionComponent<Props> = ({
  label,
  value: savedValue,
  defaultValue,
  onSave,
}) => {
  const [isLocked, setIsLocked] = useState(!Boolean(savedValue));
  const [editValue, setEditValue] = useState(savedValue);

  useEffect(() => {
    setEditValue(savedValue);
  }, [savedValue]);

  const handleToggleLock = () => {
    onSave(defaultValue);
    setEditValue(defaultValue);

    setIsLocked((prev) => !prev);
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
            'caption-medium-regular',
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
    </div>
  );
};

export default LockedSetting;

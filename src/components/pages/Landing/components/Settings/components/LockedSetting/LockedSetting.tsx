import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import FilePicker, { Size as FilePickerSize } from 'src/components/FilePicker';
import FolderPicker, {
  Size as FolderPickerSize,
} from 'src/components/FolderPicker';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import { useToastContext } from 'src/providers/toast';

import style from './LockedSetting.module.scss';
import { PickerType, Props } from './types';

const LockedSetting: FunctionComponent<Props> = ({
  label,
  value: savedValue,
  defaultValue,
  onSave,
  lockedNote,
  lockedNoteIcon,
  pickerType = PickerType.folder,
  acceptedExtensions = [],
}) => {
  const { showErrorToast } = useToastContext();

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
        <span className={classNames('body-sm-regular', 'secondary-text-color')}>
          {label}
        </span>
        <div className={style.headerActions}>
          {!isLocked && pickerType === PickerType.file && (
            <FilePicker
              onSelect={onSave}
              onError={showErrorToast}
              acceptedExtensions={acceptedExtensions}
              label='Browse'
              size={FilePickerSize.small}
            />
          )}
          {!isLocked && pickerType === PickerType.folder && (
            <FolderPicker
              onSelect={onSave}
              onError={showErrorToast}
              label='Browse'
              size={FolderPickerSize.small}
            />
          )}
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

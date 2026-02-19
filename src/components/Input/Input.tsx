import classNames from 'classnames';
import {
  ChangeEvent,
  FocusEvent,
  FunctionComponent,
  KeyboardEvent,
  useEffect,
  useRef,
} from 'react';

import style from './Input.module.scss';
import { Props, Size } from './types';

const Input: FunctionComponent<Props> = ({
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  forceFocus = false,
  size = Size.small,
  error = false,
  label,
  errorMessage,
  inputType,
  inputMode,
  autoFocus,
  placeholder,
  readonly = false,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forceFocus && ref.current) {
      ref.current.focus();
    }
  }, [forceFocus]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (onFocus) {
      onFocus(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  /* eslint-disable jsx-a11y/no-autofocus */

  const input = (
    <>
      <div
        className={classNames(style.container, {
          [style.small]: size === Size.small,
          [style.medium]: size === Size.medium,
          [style.big]: size === Size.big,
          [style.error]: error,
          [style.readonly]: readonly,
        })}>
        <input
          className={classNames(
            style.input,
            'secondary-text-color',
            'caption-big-regular',
          )}
          placeholder={placeholder}
          value={value}
          ref={ref}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          type={inputType}
          inputMode={inputMode}
          autoFocus={autoFocus}
          required={inputType === 'date'}
          readOnly={readonly}
          disabled={readonly}
        />
      </div>
      {errorMessage && (
        <div className={style.messageWrapper}>
          <p className={classNames('accent-error-text-color', style.message)}>
            {errorMessage}
          </p>
        </div>
      )}
    </>
  );

  if (label) {
    return (
      <label className={classNames(style.label)}>
        <span
          className={classNames(
            'caption-medium-regular',
            'secondary-text-color',
            style.labelText,
          )}>
          {label}
        </span>
        {input}
      </label>
    );
  }

  return <div className={style.wrapper}>{input}</div>;
};

export default Input;

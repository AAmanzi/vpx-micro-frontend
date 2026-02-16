import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import Icon from 'src/components/Icon';

import style from './Settings.module.scss';

interface Props {
  id: string;
  close: () => void;
}

const Settings: FunctionComponent<Props> = ({ id, close }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleClick = (event: MouseEvent): void => {
    if (event.target === null) {
      return;
    }

    if (ref.current && !ref.current.contains(event.target as Node)) {
      close();
    }
  };

  useEffect(() => {
    if (ref.current) {
      document.addEventListener('mousedown', handleClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref]);

  return (
    <div ref={ref} className={style.container}>
      <button
        onClick={() => setIsRenameModalOpen(true)}
        className={style.button}>
        <div className={style.iconWrapper}>
          <Icon icon='edit' className={style.icon} />
        </div>
        <span className={classNames('caption-medium-semibold', style.label)}>
          Rename Table
        </span>
      </button>
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className={classNames(style.button, style.danger)}>
        <div className={style.iconWrapper}>
          <Icon icon='trash' className={style.icon} />
        </div>
        <span className={classNames('caption-medium-semibold', style.label)}>
          Delete table
        </span>
      </button>
    </div>
  );
};

export default Settings;

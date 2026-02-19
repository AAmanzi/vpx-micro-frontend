import classNames from 'classnames';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Icon from 'src/components/Icon';

import style from './Settings.module.scss';
import DeleteTableModal from './components/DeleteTableModal';
import RenameTableModal from './components/RenameTableModal';

interface Props {
  id: string;
  name: string;
  romFile?: string;
  vpxFile: string;
  close: () => void;
}

const Settings: FunctionComponent<Props> = ({
  id,
  name,
  romFile,
  vpxFile,
  close,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleClick = useCallback(
    (event: MouseEvent): void => {
      if (event.target === null) {
        return;
      }

      const targetElement =
        event.target instanceof Element ? event.target : null;

      if (targetElement?.closest('#modal')) {
        return;
      }

      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

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
      {isRenameModalOpen && (
        <RenameTableModal
          id={id}
          name={name}
          close={() => setIsRenameModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteTableModal
          id={id}
          name={name}
          vpxFile={vpxFile}
          romFile={romFile}
          close={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;

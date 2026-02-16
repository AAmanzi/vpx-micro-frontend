import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';
import { FiPlay, FiStar } from 'react-icons/fi';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';

import Button from 'src/components/Button';
import Icon from 'src/components/Icon';
import { Table } from 'src/types/table';

import style from './TableCard.module.scss';
import Settings from './components/Settings';

type Props = Table;

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  name,
  romFile,
  vpxFile,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handlePlay = () => {
    console.log('Play table:', id);
  };

  const handleToggleFavorite = () => {
    console.log('Toggle favorite for table:', id);
    setFavorite((prev) => !prev);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className={style.card}>
      <div className={style.playArea}>
        <Button circle icon='play' onClick={handlePlay} />
      </div>

      <button
        type='button'
        className={classNames(style.favoriteButton, {
          [style.isFavorite]: favorite,
        })}
        onClick={handleToggleFavorite}>
        <Icon
          className={classNames(style.favoriteIcon)}
          icon='star'
          width={16}
          height={16}
        />
      </button>

      <div className={style.content}>
        <div className={style.header}>
          <h3
            className={classNames(
              'primary-text-color',
              'title-h5-bold',
              style.title,
            )}>
            {name}
          </h3>
          <button
            type='button'
            className={style.settingsButton}
            onClick={openSettings}>
            <Icon className='secondary-text-color' icon='kebab' />
            {isSettingsOpen && (
              <div className={style.settingsContainer}>
                <Settings id={id} close={closeSettings} />
              </div>
            )}
          </button>
        </div>

        <div className={style.meta}>
          <p className='secondary-text-color caption-small-regular'>
            {vpxFile}
          </p>
          <p className='secondary-text-color caption-small-regular'>
            ROM: {romFile}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableCard;

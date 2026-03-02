import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { Table } from 'src/types/table';
import { displayDateWithTime } from 'src/utils';

import style from './TableCard.module.scss';
import Settings from './components/Settings';

type Props = Table;

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  name,
  romFile,
  vpxFile,
  lastPlayedTimestamp,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handlePlay = () => {
    // TODO: Response handling
    api.startTable(id);
  };

  const handleToggleFavorite = () => {
    // TODO: Response handling
    setFavorite((prev) => {
      const newFav = !prev;

      api.setTableFavorite(id, newFav);

      return newFav;
    });
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
                <Settings
                  id={id}
                  name={name}
                  vpxFile={vpxFile}
                  romFile={romFile}
                  close={closeSettings}
                />
              </div>
            )}
          </button>
        </div>

        <div className={style.meta}>
          <p className='secondary-text-color caption-small-regular'>
            {vpxFile}
          </p>
          {romFile && (
            <p className='secondary-text-color caption-small-regular'>
              ROM: {romFile}
            </p>
          )}
          {lastPlayedTimestamp && (
            <p className='secondary-text-color caption-small-regular'>
              Last Played:{' '}
              {lastPlayedTimestamp
                ? displayDateWithTime(lastPlayedTimestamp)
                : 'Never'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;

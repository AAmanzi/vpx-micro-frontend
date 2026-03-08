import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { Table } from 'src/types/table';
import {
  displayDate,
  displayRelativeDate,
  getTableGradientVariant,
} from 'src/utils';

import style from './TableCard.module.scss';
import Settings from './components/Settings';

type Props = Table;

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  name,
  romFile,
  vpxFile,
  dateAddedTimestamp,
  lastPlayedTimestamp,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();

  const handlePlay = async () => {
    const { error } = await api.startTable(id);
    fetchTables();

    if (error) {
      showErrorToast(error.message || 'Failed to start table');
    }
  };

  const handleToggleFavorite = async () => {
    const newFav = !favorite;

    setFavorite(newFav);

    const { error } = await api.setTableFavorite(id, newFav);

    if (error) {
      setFavorite(!newFav);
      showErrorToast(error.message || 'Failed to update favorite');

      return;
    }

    fetchTables();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className={style.card}>
      <div
        className={classNames(
          style.playArea,
          getTableGradientVariant({ romFile, vpxFile, id } as Table),
        )}>
        <Button
          circle
          icon='play'
          onClick={handlePlay}
          size={ButtonSize.large}
          type={ButtonType.secondary}
        />
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
              'heading-5-bold',
              style.title,
            )}>
            {name}
          </h3>
          <div className={style.settingsButton}>
            <button
              type='button'
              className={style.settingsTrigger}
              onClick={openSettings}>
              <Icon className='secondary-text-color' icon='kebab' />
            </button>
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
          </div>
        </div>

        <div className={style.meta}>
          <p className='secondary-text-color body-xs-semibold'>
            {vpxFile}
          </p>
          {romFile && (
            <div className={style.romPill}>
              <span className={style.romDot} />
              <p className='secondary-text-color body-xs-semibold'>
                {romFile}
              </p>
            </div>
          )}

          <div className={style.datesGrid}>
            <div className={style.dateItem}>
              <p className='secondary-text-color body-xs-semibold uppercase'>
                Added
              </p>
              <p className='secondary-text-color body-xs-semibold uppercase'>
                {displayDate(dateAddedTimestamp)}
              </p>
            </div>
            <div className={style.dateItem}>
              <p className='secondary-text-color body-xs-semibold uppercase'>
                Last Played
              </p>
              <p className='secondary-text-color body-xs-semibold uppercase'>
                {displayRelativeDate(lastPlayedTimestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCard;

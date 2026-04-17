import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { DEFAULT_START_TABLE_KEY } from 'src/consts/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { Table } from 'src/types/table';
import {
  displayDate,
  displayRelativeDate,
  getTableGradientVariant,
} from 'src/utils';

import SettingsPopover from '../SettingsPopover';
import style from './TableCard.module.scss';

type Props = Table & {
  isSelected?: boolean;
  dataTableId?: string;
};

const START_TABLE_KEY = DEFAULT_START_TABLE_KEY;

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  isSelected = false,
  dataTableId,
  isArchived,
  name,
  romFile,
  romFilePath,
  vpxFile,
  vpxFilePath,
  vpxExecutablePath,
  dateAddedTimestamp,
  lastPlayedTimestamp,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isStarting, setIsStarting] = useState(false);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();

  const handlePlay = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      const { error } = await api.startTable(id);

      if (error) {
        showErrorToast(error.message || 'Failed to start table');

        return;
      }

      fetchTables();
    } finally {
      setIsStarting(false);
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

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if (event.key !== START_TABLE_KEY || isTypingTarget) {
        return;
      }

      event.preventDefault();
      handlePlay();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlay, isSelected]);

  return (
    <div
      data-table-id={dataTableId}
      className={classNames(style.card, {
        [style.selected]: isSelected,
      })}>
      <div
        className={classNames(
          style.playArea,
          getTableGradientVariant({ romFile, vpxFile, id } as Table),
        )}>
        <Button
          circle
          icon='play'
          loading={isStarting}
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
            <SettingsPopover
              id={id}
              name={name}
              isArchived={isArchived}
              vpxFilePath={vpxFilePath}
              vpxExecutablePath={vpxExecutablePath}
              vpxFile={vpxFile}
              romFilePath={romFilePath}
              romFile={romFile}
              triggerClassName={style.settingsTrigger}
            />
          </div>
        </div>

        <div className={style.meta}>
          <p className='secondary-text-color body-xs-semibold'>{vpxFile}</p>
          {romFile && (
            <div className={style.romPill}>
              <span className={style.romDot} />
              <p className='secondary-text-color body-xs-semibold'>{romFile}</p>
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

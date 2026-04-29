import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { Table } from 'src/types/table';
import {
  displayRelativeDate,
  getTableGradientVariable,
  getTableGradientVariant,
} from 'src/utils';

import SettingsPopover from '../SettingsPopover';
import TableDetailsPopover from '../TableDetailsPopover';
import style from './TableCard.module.scss';

type Props = Table;

const timesPlayed = 12;
const timePlayed = '3.2h';
const bestScore = 1245000;
const formattedBestScore = bestScore.toLocaleString();

const getPlayAreaStyle = (gradientColor: string, imgUrl?: string) => ({
  backgroundImage: imgUrl
    ? `linear-gradient(180deg, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.84) 100%), url("${imgUrl}"), ${gradientColor}`
    : undefined,
});

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  isForAndroid,
  isArchived,
  name,
  romFile,
  romFilePath,
  vpxFile,
  vpxFilePath,
  vpxExecutablePath,
  imgUrl,
  imagePreference,
  dateAddedTimestamp,
  lastPlayedTimestamp,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [forAndroid, setForAndroid] = useState(Boolean(isForAndroid));
  const [isStarting, setIsStarting] = useState(false);
  const tableGradient = getTableGradientVariant({
    romFile,
    vpxFile,
    id,
  } as Table);
  const tableGradientColor = getTableGradientVariable({
    romFile,
    vpxFile,
    id,
  } as Table);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();
  const { config } = useConfigContext();
  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);

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

  const handleToggleAndroid = async () => {
    const newValue = !forAndroid;

    setForAndroid(newValue);

    const { error } = await api.setTableForAndroid(id, newValue);

    if (error) {
      setForAndroid(!newValue);
      showErrorToast(error.message || 'Failed to update Android flag');

      return;
    }

    fetchTables();
  };

  return (
    <div className={style.card}>
      <div
        className={classNames(style.playArea, tableGradient)}
        style={getPlayAreaStyle(tableGradientColor, imgUrl)}>
        <Button
          circle
          icon='play'
          loading={isStarting}
          onClick={handlePlay}
          size={ButtonSize.large}
          type={ButtonType.secondaryTransparent}
        />
      </div>

      {androidFeaturesEnabled && (
        <button
          type='button'
          className={classNames(style.androidButton, {
            [style.isForAndroid]: forAndroid,
          })}
          onClick={handleToggleAndroid}>
          <Icon
            className={classNames(style.androidIcon)}
            icon='phone'
            width={16}
            height={16}
          />
        </button>
      )}

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
              imgUrl={imgUrl}
              imagePreference={imagePreference}
              triggerClassName={style.settingsTrigger}
            />
          </div>
        </div>

        <div className={style.meta}>
          <div className={style.statPills}>
            <span
              className={classNames(
                'secondary-text-color',
                'body-xs-semibold',
                style.statPill,
              )}>
              {timesPlayed} plays
            </span>
            <span
              className={classNames(
                'secondary-text-color',
                'body-xs-semibold',
                style.statPill,
              )}>
              {timePlayed} total
            </span>
          </div>

          <div className={style.scoreBlock}>
            <p
              className={classNames(
                'primary-text-color',
                'body-xs-semibold',
                style.metaLabel,
              )}>
              Best score
            </p>
            <p
              className={classNames(
                'secondary-text-color',
                'body-sm-bold',
                style.scoreValue,
              )}>
              {formattedBestScore}
            </p>
          </div>

          <div className={style.footerRow}>
            <div className={style.lastPlayedBlock}>
              <p
                className={classNames(
                  'primary-text-color',
                  'body-xs-semibold',
                  style.metaLabel,
                )}>
                Last played
              </p>
              <p
                className={classNames(
                  'secondary-text-color',
                  'body-xs-semibold',
                )}>
                {displayRelativeDate(lastPlayedTimestamp)}
              </p>
            </div>
            <TableDetailsPopover
              vpxFile={vpxFile}
              romFile={romFile}
              dateAddedTimestamp={dateAddedTimestamp}
              triggerClassName={style.detailsTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCard;

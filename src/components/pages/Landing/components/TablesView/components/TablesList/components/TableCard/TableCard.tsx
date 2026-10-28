import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import Tooltip from 'src/components/Tooltip';
import api from 'src/consts';
import { TABLE_STARTUP_LOCK_MS } from 'src/consts/platform';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { GridSettings } from 'src/types/config';
import { ResolvedTable } from 'src/types/table';
import {
  displayDate,
  displayRelativeDate,
  getTableGradientVariable,
  getTableGradientVariant,
} from 'src/utils';

import SettingsPopover from '../SettingsPopover';
import style from './TableCard.module.scss';

type Props = ResolvedTable & {
  gridSettings: GridSettings;
  scrollToTopOnTableStart: boolean;
};

const waitForMinimumLoadingTime = async (startedAt: number): Promise<void> => {
  const elapsed = Date.now() - startedAt;
  const remaining = TABLE_STARTUP_LOCK_MS - elapsed;

  if (remaining <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, remaining);
  });
};

const getPlayAreaStyle = (gradientColor: string, imgUrl?: string) => ({
  backgroundImage: imgUrl
    ? `linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.36) 100%), url("${imgUrl}"), ${gradientColor}`
    : undefined,
});

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  isForAndroid,
  isArchived,
  name,
  romFile,
  backglassFile,
  romFilePath,
  vpxFile,
  vpxFilePath,
  vpxExecutablePath,
  launchFlags,
  imgUrl,
  imagePreference,
  dateAddedTimestamp,
  lastPlayedTimestamp,
  gridSettings,
  scrollToTopOnTableStart,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [forAndroid, setForAndroid] = useState(Boolean(isForAndroid));
  const [isStarting, setIsStarting] = useState(false);
  const tableGradient = getTableGradientVariant({
    romFile,
    vpxFile,
    id,
  } as ResolvedTable);
  const tableGradientColor = getTableGradientVariable({
    romFile,
    vpxFile,
    id,
  } as ResolvedTable);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();
  const { config } = useConfigContext();
  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);
  const titleTextClass =
    gridSettings.cardSize === 'small'
      ? 'body-sm-semibold'
      : gridSettings.cardSize === 'large'
        ? 'body-lg-regular'
        : 'body-md-semibold';
  const hasVisibleMetadata =
    gridSettings.showVpxFilename ||
    (gridSettings.showRom && Boolean(romFile || backglassFile)) ||
    gridSettings.showDates;

  const handlePlay = async () => {
    if (isStarting) {
      return;
    }

    const startTimestamp = Date.now();

    setIsStarting(true);

    try {
      const { error } = await api.startTable(id);

      if (error) {
        if (error.code === 'TABLE_START_IN_PROGRESS') {
          return;
        }

        showErrorToast(error.message || 'Failed to start table');

        return;
      } else if (scrollToTopOnTableStart) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      fetchTables();
    } finally {
      await waitForMinimumLoadingTime(startTimestamp);
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
    <div
      className={style.card}
      data-card-size={gridSettings.cardSize}
      data-compact={!hasVisibleMetadata}>
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
              titleTextClass,
              style.title,
            )}
            title={name}>
            {name}
          </h3>
          <div className={style.settingsButton}>
            <SettingsPopover
              id={id}
              name={name}
              isArchived={isArchived}
              vpxFilePath={vpxFilePath}
              vpxExecutablePath={vpxExecutablePath}
              launchFlags={launchFlags}
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
          {gridSettings.showVpxFilename && (
            <p
              className={classNames(
                'secondary-text-color',
                'body-xs-regular',
                style.vpxFilename,
              )}
              title={vpxFile}>
              {vpxFile}
            </p>
          )}
          {gridSettings.showRom && (romFile || backglassFile) && (
            <div className={style.romRow}>
              {romFile && (
                <div
                  className={classNames(style.romPill, {
                    [style.romPillWithBackglass]: backglassFile,
                  })}>
                  <span className={style.romDot} />
                  <p className='secondary-text-color body-xs-semibold'>
                    {romFile}
                  </p>
                </div>
              )}
              {backglassFile && (
                <Tooltip
                  className={style.backglassTooltipContainer}
                  content='DirectB2S backglass file detected'
                  placement='top-end'>
                  <span
                    className={classNames(
                      'body-xxs-semibold',
                      style.backglassIndicator,
                    )}>
                    B2S
                  </span>
                </Tooltip>
              )}
            </div>
          )}

          {gridSettings.showDates && (
            <div className={style.datesGrid}>
              <div className={style.dateItem}>
                <p className='secondary-text-color body-xxs-semibold uppercase'>
                  Added
                </p>
                <p className='secondary-text-color body-xs-regular'>
                  {displayDate(dateAddedTimestamp)}
                </p>
              </div>
              <div className={style.dateItem}>
                <p className='secondary-text-color body-xxs-semibold uppercase'>
                  Last Played
                </p>
                <p className='secondary-text-color body-xs-regular'>
                  {displayRelativeDate(lastPlayedTimestamp)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;

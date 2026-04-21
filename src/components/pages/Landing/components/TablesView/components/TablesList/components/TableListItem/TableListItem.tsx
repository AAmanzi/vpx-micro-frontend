import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

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
  displayDate,
  displayRelativeDate,
  getTableGradientVariant,
} from 'src/utils';

import SettingsPopover from '../SettingsPopover';
import style from './TableListItem.module.scss';

type Props = Table;

const getPlayAreaStyle = (imgUrl?: string) => ({
  backgroundImage: imgUrl
    ? `linear-gradient(180deg, rgba(0, 0, 0, 0.15) 15%, rgba(0, 0, 0, 0.78) 100%), url("${imgUrl}")`
    : undefined,
});

const TableListItem: FunctionComponent<Props> = ({
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
  dateAddedTimestamp,
  lastPlayedTimestamp,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [forAndroid, setForAndroid] = useState(Boolean(isForAndroid));
  const [isStarting, setIsStarting] = useState(false);
  const [isNameTruncated, setIsNameTruncated] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();
  const { config } = useConfigContext();
  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);

  useEffect(() => {
    const updateTruncation = () => {
      const element = titleRef.current;

      if (!element) {
        setIsNameTruncated(false);

        return;
      }

      setIsNameTruncated(element.scrollWidth > element.clientWidth);
    };

    updateTruncation();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateTruncation);

      return () => {
        window.removeEventListener('resize', updateTruncation);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateTruncation();
    });

    if (titleRef.current) {
      resizeObserver.observe(titleRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [name]);

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
    <div className={style.item}>
      <div
        className={classNames(
          style.playArea,
          getTableGradientVariant({ romFile, vpxFile, id } as Table),
        )}
        style={getPlayAreaStyle(imgUrl)}>
        <Button
          circle
          icon='play'
          loading={isStarting}
          onClick={handlePlay}
          size={ButtonSize.small}
          type={ButtonType.secondaryTransparent}
        />
      </div>

      <div className={style.content}>
        <div className={style.header}>
          <div className={style.titleSection}>
            <div className={style.titleWrapper}>
              <h3
                ref={titleRef}
                className={classNames(
                  'primary-text-color',
                  'heading-6-bold',
                  style.title,
                )}>
                {name}
              </h3>
              {isNameTruncated && (
                <span
                  className={classNames('body-xs-regular', style.titleTooltip)}>
                  {name}
                </span>
              )}
            </div>
            <p className='secondary-text-color body-xs-semibold'>{vpxFile}</p>
          </div>
        </div>
      </div>

      {romFile && (
        <div className={style.romPill}>
          <span className={style.romDot} />
          <p className='secondary-text-color body-xs-semibold'>{romFile}</p>
        </div>
      )}

      <div className={style.datesContainer}>
        <div className={style.dateItem}>
          <p className='secondary-text-color body-xs-semibold uppercase'>
            Added
          </p>
          <p className='secondary-text-color body-xs-semibold'>
            {displayDate(dateAddedTimestamp)}
          </p>
        </div>
        <div className={style.dateItem}>
          <p className='secondary-text-color body-xs-semibold uppercase'>
            Last Played
          </p>
          <p className='secondary-text-color body-xs-semibold'>
            {displayRelativeDate(lastPlayedTimestamp)}
          </p>
        </div>
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
  );
};

export default TableListItem;

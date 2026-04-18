import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useSelectable } from 'src/providers/selection';
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

type Props = Table & {
  isSelected?: boolean;
  selectionKey: string;
  selectionOrder: number;
};

const TableListItem: FunctionComponent<Props> = ({
  id,
  isFavorite,
  isSelected = false,
  selectionKey,
  selectionOrder,
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
  const [isNameTruncated, setIsNameTruncated] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const { showErrorToast } = useToastContext();
  const { fetchTables } = useTablesContext();

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

  const { select, selectableKey } = useSelectable({
    key: selectionKey,
    type: 'table',
    id,
    order: selectionOrder,
    onAction: handlePlay,
    getElement: () => rootRef.current,
  });

  return (
    <div
      ref={rootRef}
      data-table-id={id}
      data-selectable-key={selectableKey}
      onMouseDown={select}
      className={classNames(style.item, {
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
          size={ButtonSize.small}
          type={ButtonType.secondary}
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

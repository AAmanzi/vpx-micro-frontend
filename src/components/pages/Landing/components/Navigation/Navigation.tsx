import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, { Size as ButtonSize } from 'src/components/Button';
import Icon from 'src/components/Icon';
import ImportTablesModal from 'src/components/ImportTablesModal';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';

import { View } from '../../types';
import style from './Navigation.module.scss';

interface Props {
  view: View;
  setView: (view: View) => void;
  librarySize: number;
}

const Navigation: FunctionComponent<Props> = ({
  view,
  setView,
  librarySize,
}) => {
  const { fetchTables } = useTablesContext();
  const { config } = useConfigContext();
  const fullVpxPath = config?.vpxRootPath || '';

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    fetchTables();
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.importButtonWrapper}>
          <Button
            icon='plus'
            label='Import Tables'
            size={ButtonSize.large}
            onClick={() => setIsImportModalOpen(true)}
            fill
          />
        </div>
        <div className={style.navigation}>
          <div className={style.section}>
            <h3
              className={classNames(
                'caption-small-semibold',
                'secondary-text-color',
                'uppercase',
                style.sectionTitle,
              )}>
              Navigation
            </h3>
            <button
              onClick={() => setView(View.allTables)}
              className={classNames(style.button, style.blue, {
                [style.active]: view === View.allTables,
              })}>
              <div className={style.iconWrapper}>
                <Icon icon='grid' className={style.icon} />
              </div>
              <span className={classNames('button-text-16', style.label)}>
                All Tables
              </span>
            </button>
            <button
              onClick={() => setView(View.favorites)}
              className={classNames(style.button, style.yellow, {
                [style.active]: view === View.favorites,
              })}>
              <div className={style.iconWrapper}>
                <Icon icon='star' className={style.icon} />
              </div>
              <span className={classNames('button-text-16', style.label)}>
                Favorites
              </span>
            </button>
            <button
              onClick={() => setView(View.recentlyPlayed)}
              className={classNames(style.button, style.green, {
                [style.active]: view === View.recentlyPlayed,
              })}>
              <div className={style.iconWrapper}>
                <Icon icon='clock-recent' className={style.icon} />
              </div>
              <span className={classNames('button-text-16', style.label)}>
                Recent
              </span>
            </button>
          </div>
          <div className={style.section}>
            <h3
              className={classNames(
                'caption-small-semibold',
                'secondary-text-color',
                style.sectionTitle,
              )}>
              System
            </h3>
            <button
              onClick={() => setView(View.settings)}
              className={classNames(style.button, style.purple, {
                [style.active]: view === View.settings,
              })}>
              <div className={style.iconWrapper}>
                <Icon icon='cog' className={style.icon} />
              </div>
              <span className={classNames('button-text-16', style.label)}>
                Settings
              </span>
            </button>
          </div>
        </div>
        <div className={style.meta}>
          <div className={style.metaLabel}>
            <Icon
              icon='folder'
              width={14}
              height={14}
              className='secondary-text-color'
            />
            <span className='caption-small-semibold secondary-text-color'>
              VPX PATH
            </span>
          </div>
          <div className={style.metaPathWrapper}>
            <span
              className={classNames(
                'caption-small-regular',
                'secondary-text-color',
                style.metaPath,
              )}>
              {fullVpxPath}
            </span>
            {fullVpxPath && (
              <span
                className={classNames(
                  'caption-small-regular',
                  style.metaPathTooltip,
                )}>
                {fullVpxPath}
              </span>
            )}
          </div>
          <div className={style.metaStat}>
            <span className='caption-small-semibold secondary-text-color'>
              LIBRARY SIZE
            </span>
            <span className='caption-small-regular secondary-text-color'>
              {librarySize} Tables
            </span>
          </div>
        </div>
      </div>
      {isImportModalOpen && (
        <ImportTablesModal onClose={handleCloseImportModal} />
      )}
    </>
  );
};

export default Navigation;

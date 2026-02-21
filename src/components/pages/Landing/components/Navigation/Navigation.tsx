import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, { Size as ButtonSize } from 'src/components/Button';
import Icon from 'src/components/Icon';
import ImportTablesModal from 'src/components/ImportTablesModal';
import { Config } from 'src/types/config';

import { View } from '../../types';
import style from './Navigation.module.scss';

interface Props {
  view: View;
  setView: (view: View) => void;
  config: Config;
}

const Navigation: FunctionComponent<Props> = ({ view, setView, config }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        <div>
          <div className={style.section}>
            <h3
              className={classNames(
                'caption-small-semibold',
                'secondary-text-color',
                style.sectionTitle,
              )}>
              Navigation
            </h3>
            <button
              onClick={() => setView(View.allTables)}
              className={classNames(style.button, {
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
              className={classNames(style.button, {
                [style.active]: view === View.favorites,
              })}>
              <div className={style.iconWrapper}>
                <Icon icon='star' className={style.icon} />
              </div>
              <span className={classNames('button-text-16', style.label)}>
                Favorites
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
              className={classNames(style.button, {
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
          <span className='caption-small-semibold secondary-text-color'>
            {config.vpxRootPath}
          </span>
        </div>
      </div>
      {isImportModalOpen && (
        <ImportTablesModal onClose={() => setIsImportModalOpen(false)} />
      )}
    </>
  );
};

export default Navigation;

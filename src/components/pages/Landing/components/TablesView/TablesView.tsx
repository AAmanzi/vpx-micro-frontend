import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import ImportTablesModal from 'src/components/ImportTablesModal';
import Input from 'src/components/Input';
import ScanLibraryModal from 'src/components/ScanLibraryModal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { Order } from 'src/types/config';
import type { Table } from 'src/types/table';

import style from './TablesView.module.scss';
import OrderPicker from './components/OrderPicker';
import TablesList from './components/TablesList';
import { Props } from './types';

const TablesView: FunctionComponent<Props> = ({
  tables,
  librarySize,
  title,
  description,
  defaultOrder,
}) => {
  const { fetchTables } = useTablesContext();
  const { config, fetchConfig } = useConfigContext();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScanLibraryModalOpen, setIsScanLibraryModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const favoritesOnTop = config?.keepFavoritesOnTop ?? true;
  const order = defaultOrder ?? config?.order ?? Order.dateAddedDesc;

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    fetchTables();
  };

  const handleFavoritesOnTopChange = async (newValue: boolean) => {
    if (newValue === favoritesOnTop) {
      return;
    }

    await api.updateKeepFavoritesOnTop(newValue);

    fetchConfig();
  };

  const handleOrderChange = async (newValue: Order) => {
    if (newValue === order) {
      return;
    }

    await api.updateOrder(newValue);

    fetchConfig();
  };

  const getFilteredTables = () => {
    if (!query) {
      return tables;
    }

    const lowerCaseQuery = query.toLowerCase();

    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(lowerCaseQuery) ||
        table.vpxFile.toLowerCase().includes(lowerCaseQuery) ||
        table.romFile?.toLowerCase().includes(lowerCaseQuery),
    );
  };
  const filteredTables = getFilteredTables();

  const getOrderComparison = (a: Table, b: Table): number => {
    switch (order) {
      case Order.nameAsc:
        return a.name.localeCompare(b.name);
      case Order.nameDesc:
        return b.name.localeCompare(a.name);
      case Order.dateAddedAsc:
        return (
          new Date(a.dateAddedTimestamp).getTime() -
          new Date(b.dateAddedTimestamp).getTime()
        );
      case Order.dateAddedDesc:
        return (
          new Date(b.dateAddedTimestamp).getTime() -
          new Date(a.dateAddedTimestamp).getTime()
        );
      case Order.recentlyPlayed:
        return (
          new Date(b.lastPlayedTimestamp || 0).getTime() -
          new Date(a.lastPlayedTimestamp || 0).getTime()
        );
      case Order.leastPlayed:
        return (
          new Date(a.lastPlayedTimestamp || 0).getTime() -
          new Date(b.lastPlayedTimestamp || 0).getTime()
        );
      default:
        return 0;
    }
  };

  const orderedTables = [...filteredTables].sort((a, b) => {
    if (favoritesOnTop && a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    return getOrderComparison(a, b);
  });

  const displayedDescription = query
    ? `Found ${filteredTables.length} results for "${query}"`
    : description;

  const isLibraryEmpty = librarySize === 0;
  const hasResults = !isLibraryEmpty && filteredTables.length > 0;
  const hasNoSearchResults =
    !isLibraryEmpty && filteredTables.length === 0 && query;

  return (
    <>
      <div className={style.header}>
        <div className={style.search}>
          <Input
            value={query}
            onChange={setQuery}
            icon='search'
            placeholder='Search tables, vpx files or roms...'
          />
        </div>
        <div className={style.infoAndFiltering}>
          <OrderPicker
            favoritesOnTop={favoritesOnTop}
            onFavoritesOnTopChange={handleFavoritesOnTopChange}
            order={order}
            onOrderChange={handleOrderChange}
          />
        </div>
      </div>
      <div className={style.container}>
        <div className={style.titleRow}>
          <div>
            <h1 className='primary-text-color heading-4-bold'>{title}</h1>
            <p className='secondary-text-color body-md-regular'>
              {displayedDescription}
            </p>
          </div>
          <div className={style.scanButtonWrapper}>
            <Button
              icon='scan-search'
              label='Scan Library'
              type={ButtonType.primaryAltTransparent}
              size={ButtonSize.medium}
              onClick={() => setIsScanLibraryModalOpen(true)}
              fill
            />
          </div>
        </div>

        <div className={style.tablesWrapper}>
          {hasResults && <TablesList tables={orderedTables} />}{' '}
          {hasNoSearchResults && (
            <div className={style.noData}>
              <div className={style.noDataIconWrapper}>
                <Icon
                  className='secondary-text-color'
                  icon='search'
                  width={40}
                  height={40}
                />
              </div>
              <h2
                className={classNames(
                  'primary-text-color',
                  'heading-4-bold',
                  style.noDataTitle,
                )}>
                No tables found
              </h2>
              <p
                className={classNames(
                  'secondary-text-color',
                  'body-md-regular',
                  style.noDataDescription,
                )}>
                We couldn't find any tables matching your current filter or
                search criteria.
              </p>
              <Button
                label='Clear Search'
                type={ButtonType.secondary}
                onClick={() => setQuery('')}
              />
            </div>
          )}
          {isLibraryEmpty && (
            <div>
              <div className={style.noData}>
                <div className={style.noDataIconWrapper}>
                  <Icon
                    className='secondary-text-color'
                    icon='plus'
                    width={40}
                    height={40}
                  />
                </div>
                <h2
                  className={classNames(
                    'primary-text-color',
                    'heading-4-bold',
                    style.noDataTitle,
                  )}>
                  Your library is empty
                </h2>
                <p
                  className={classNames(
                    'secondary-text-color',
                    'body-md-regular',
                    style.noDataDescription,
                  )}>
                  Start your collection by importing .vpx table files and their
                  corresponding ROMs.
                </p>
                <Button
                  icon='plus'
                  label='Import now'
                  onClick={() => setIsImportModalOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {isImportModalOpen && (
        <ImportTablesModal onClose={handleCloseImportModal} />
      )}
      {isScanLibraryModalOpen && (
        <ScanLibraryModal close={() => setIsScanLibraryModalOpen(false)} />
      )}
    </>
  );
};

export default TablesView;

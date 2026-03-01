import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, { Type as ButtonType } from 'src/components/Button';
import Icon from 'src/components/Icon';
import ImportTablesModal from 'src/components/ImportTablesModal';
import Input from 'src/components/Input';
import { useTablesContext } from 'src/providers/tables';
import { Table } from 'src/types/table';

import style from './TablesView.module.scss';
import TablesList from './components/TablesList';

interface Props {
  title: string;
  description: string;
  tables: Array<Table>;
  librarySize: number;
}

const TablesView: FunctionComponent<Props> = ({
  tables,
  librarySize,
  title,
  description,
}) => {
  const { fetchTables } = useTablesContext();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    fetchTables();
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
        <div className={style.librarySize}>
          <p
            className={classNames(
              'secondary-text-color',
              'caption-big-regular',
              'uppercase',
            )}>
            Library size
          </p>
          <p
            className={classNames(
              'primary-text-color',
              'caption-big-semibold',
            )}>
            {librarySize} Tables
          </p>
        </div>
      </div>
      <div className={style.container}>
        <h1>{title}</h1>
        <p>{displayedDescription}</p>

        <div className={style.tablesWrapper}>
          {hasResults && <TablesList tables={filteredTables} />}{' '}
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
                  'title-h4-bold',
                  style.noDataTitle,
                )}>
                No tables found
              </h2>
              <p
                className={classNames(
                  'secondary-text-color',
                  'caption-big-regular',
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
                    'title-h4-bold',
                    style.noDataTitle,
                  )}>
                  Your library is empty
                </h2>
                <p
                  className={classNames(
                    'secondary-text-color',
                    'caption-big-regular',
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
    </>
  );
};

export default TablesView;

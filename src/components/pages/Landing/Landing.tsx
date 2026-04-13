import { FunctionComponent, useState } from 'react';

import { useTablesContext } from 'src/providers/tables';
import { Order } from 'src/types/config';

import style from './Landing.module.scss';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import TablesView from './components/TablesView';
import { View } from './types';

const NUMBER_OF_RECENTLY_PLAYED_TABLES = 10;

interface Props {}

const Landing: FunctionComponent<Props> = () => {
  const [view, setView] = useState<View>(View.allTables);

  const { tables } = useTablesContext();

  const handleChangeView = (value: View) => {
    setView(value);
  };

  const getView = () => {
    switch (view) {
      case View.allTables:
        return (
          <TablesView
            tables={tables}
            librarySize={tables.length}
            title='All Tables'
            description='Manage your Visual Pinball library'
          />
        );
      case View.favorites:
        return (
          <TablesView
            tables={tables.filter((table) => table.isFavorite)}
            librarySize={tables.length}
            title='Favorites'
            emptyStateVariant='favorites'
          />
        );
      case View.recentlyPlayed:
        const sortedTables = tables.sort((a, b) => {
          return (
            new Date(b.lastPlayedTimestamp || 0).getTime() -
            new Date(a.lastPlayedTimestamp || 0).getTime()
          );
        });
        const recentlyPlayedTables = sortedTables
          .filter((table) => Boolean(table.lastPlayedTimestamp))
          .slice(0, NUMBER_OF_RECENTLY_PLAYED_TABLES);

        return (
          <TablesView
            tables={recentlyPlayedTables}
            librarySize={tables.length}
            title='Recently Played'
            defaultOrder={Order.recentlyPlayed}
            emptyStateVariant='recentlyPlayed'
            isOrderPickerDisabled
          />
        );
      case View.settings:
        return <Settings />;
    }
  };

  return (
    <div className={style.container}>
      <div className={style.navigationWrapper}>
        <Navigation
          view={view}
          setView={handleChangeView}
          librarySize={tables.length}
        />
      </div>
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

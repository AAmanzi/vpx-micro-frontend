import { FunctionComponent, useEffect, useState } from 'react';

import { useConfigContext } from 'src/providers/config';
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

  const { tables: allTables } = useTablesContext();
  const { config } = useConfigContext();
  const androidFeaturesEnabled = Boolean(config?.androidFeaturesEnabled);

  const handleChangeView = (value: View) => {
    setView(value);
  };

  const tables = allTables.filter((table) => !table.isArchived);
  const archivedTables = allTables.filter((table) => table.isArchived);

  useEffect(() => {
    if (view === View.archive && archivedTables.length === 0) {
      setView(View.allTables);
    }
  }, [view, archivedTables.length]);

  useEffect(() => {
    if (!androidFeaturesEnabled && view === View.android) {
      setView(View.allTables);
    }
  }, [androidFeaturesEnabled, view]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const getView = () => {
    switch (view) {
      case View.allTables:
        return (
          <TablesView
            animationKey={view}
            tables={tables}
            librarySize={tables.length}
            title='All Tables'
            // description='Manage your Visual Pinball library'
          />
        );
      case View.favorites:
        return (
          <TablesView
            animationKey={view}
            tables={tables.filter((table) => table.isFavorite)}
            librarySize={tables.length}
            title='Favorites'
            emptyStateVariant='favorites'
          />
        );
      case View.android:
        return (
          <TablesView
            animationKey={view}
            tables={tables.filter((table) => table.isForAndroid)}
            librarySize={tables.length}
            title='Android'
            emptyStateVariant='android'
            isScanLibraryDisabled
            androidFeaturesEnabled
          />
        );
      case View.recentlyPlayed:
        const sortedTables = [...tables].sort((a, b) => {
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
            animationKey={view}
            tables={recentlyPlayedTables}
            librarySize={tables.length}
            title='Recently Played'
            defaultOrder={Order.recentlyPlayed}
            emptyStateVariant='recentlyPlayed'
            isOrderPickerDisabled
          />
        );
      case View.archive:
        return (
          <TablesView
            animationKey={view}
            tables={archivedTables}
            librarySize={archivedTables.length}
            title='Archive'
            // description='Archived tables are hidden from your main library views'
            emptyStateVariant='archive'
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
          archivedTablesCount={archivedTables.length}
        />
      </div>
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

import { FunctionComponent, useEffect, useState } from 'react';

import { api } from 'src/consts';
import { Config } from 'src/types/config';
import { Table } from 'src/types/table';

import style from './Landing.module.scss';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import TablesView from './components/TablesView';
import { View } from './types';

interface Props {}

const Landing: FunctionComponent<Props> = () => {
  const [view, setView] = useState<View>(View.allTables);
  const [tables, setTables] = useState<Array<Table>>([]);
  const [config, setConfig] = useState<Config | null>(null);

  const fetchTables = () => {
    api.getAllTables().then(setTables);
  };

  useEffect(() => {
    fetchTables();
    api.getConfig().then(setConfig);
  }, []);

  const handleChangeView = (value: View) => {
    setView(value);
  };

  if (!config) {
    return null;
  }

  const getView = () => {
    switch (view) {
      case View.allTables:
        return (
          <TablesView
            tables={tables}
            allTables={tables}
            librarySize={tables.length}
            title='All Tables'
            description='Manage your Visual Pinball library'
            refetchTables={fetchTables}
          />
        );
      case View.favorites:
        return (
          <TablesView
            tables={tables.filter((table) => table.isFavorite)}
            allTables={tables}
            librarySize={tables.length}
            title='Favorites'
            description='Manage your favorite Visual Pinball tables'
            refetchTables={fetchTables}
          />
        );
      case View.settings:
        return <Settings config={config} />;
    }
  };

  return (
    <div className={style.container}>
      <Navigation
        view={view}
        setView={handleChangeView}
        config={config}
        tables={tables}
        refetchTables={fetchTables}
      />
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

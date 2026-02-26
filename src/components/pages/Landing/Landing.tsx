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
  const [config, setConfig] = useState<Config>({
    vpxRootPath: 'C:/Games/VisualPinball',
  });

  useEffect(() => {
    api.getAllTables().then(setTables);
  }, []);

  const handleChangeView = (value: View) => {
    setView(value);
  };

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
      />
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

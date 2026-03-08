import { FunctionComponent, useState } from 'react';

import { useTablesContext } from 'src/providers/tables';

import style from './Landing.module.scss';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import TablesView from './components/TablesView';
import { View } from './types';

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
      // TODO: no favorites display something
      case View.favorites:
        return (
          <TablesView
            tables={tables.filter((table) => table.isFavorite)}
            librarySize={tables.length}
            title='Favorites'
            description='Manage your favorite Visual Pinball tables'
          />
        );
      case View.settings:
        return <Settings />;
    }
  };

  return (
    <div className={style.container}>
      <Navigation
        view={view}
        setView={handleChangeView}
        librarySize={tables.length}
      />
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

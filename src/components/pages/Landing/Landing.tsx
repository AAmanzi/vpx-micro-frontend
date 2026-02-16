import { get } from 'http';
import { FunctionComponent, useEffect, useState } from 'react';

import Button from 'src/components/Button';
import { api } from 'src/consts';
import { Config } from 'src/types/config';
import { Table } from 'src/types/table';

import style from './Landing.module.scss';
import AllTables from './components/AllTables';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import { View } from './types';

interface Props {}

const Landing: FunctionComponent<Props> = () => {
  const [view, setView] = useState<View>(View.allTables);
  const [tables, setTables] = useState<Array<Table>>([]);
  const [config, setConfig] = useState<Config>({
    vpxRootPath: 'C:/Games/VisualPinball',
  });

  useEffect(() => {
    api?.getAllTables().then(setTables);
  }, []);

  const getView = () => {
    switch (view) {
      case View.allTables:
        return <AllTables tables={tables} />;
      case View.settings:
        return <Settings />;
    }
  };

  return (
    <div className={style.container}>
      <Navigation view={view} setView={setView} config={config} />
      <div className={style.content}>{getView()}</div>
    </div>
  );
};

export default Landing;

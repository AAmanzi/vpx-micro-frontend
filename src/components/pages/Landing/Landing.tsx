import { FunctionComponent, useEffect, useState } from 'react';

import { api } from 'src/consts';
import { Table } from 'src/types/table';

import style from './Landing.module.scss';

interface Props {}

const Landing: FunctionComponent<Props> = () => {
  const [tables, setTables] = useState<Array<Table>>([]);

  useEffect(() => {
    api?.getAllTables().then(setTables);
  }, []);

  return (
    <div className={style.landing}>
      <div>
        {tables.map((table) => (
          <div key={table.id}>
            <h3>{table.name}</h3>
            <p>{table.vpxFile}</p>
            <p>{table.romFile}</p>
            <p>{table.isFavorite ? 'Favorite' : 'Not Favorite'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;

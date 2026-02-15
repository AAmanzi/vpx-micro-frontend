import { FunctionComponent } from 'react';

import TablesList from 'src/components/TablesList';
import { Table } from 'src/types/table';

import style from './AllTables.module.scss';

interface Props {
  tables: Array<Table>;
}

const AllTables: FunctionComponent<Props> = ({ tables }) => {
  return (
    <div className={style.container}>
      <h1>All Tables</h1>
      <p>Manage your Visual Pinball library</p>

      <div className={style.tablesWrapper}>
        <TablesList tables={tables} />
      </div>
    </div>
  );
};

export default AllTables;

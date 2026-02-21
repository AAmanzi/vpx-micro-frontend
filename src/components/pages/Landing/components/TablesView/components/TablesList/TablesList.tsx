import { FunctionComponent } from 'react';

import { Table } from 'src/types/table';

import style from './TablesList.module.scss';
import TableCard from './components/TableCard';

interface Props {
  tables: Array<Table>;
}

const TablesList: FunctionComponent<Props> = ({ tables }) => {
  return (
    <div className={style.container}>
      {tables.map((table) => (
        <TableCard key={table.id} {...table} />
      ))}
    </div>
  );
};

export default TablesList;

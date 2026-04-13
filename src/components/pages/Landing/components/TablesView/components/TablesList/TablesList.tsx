import { FunctionComponent } from 'react';

import { ViewType } from 'src/types/config';
import { Table } from 'src/types/table';

import style from './TablesList.module.scss';
import TableCard from './components/TableCard';
import TableListItem from './components/TableListItem';

interface Props {
  tables: Array<Table>;
  viewType: ViewType;
}

const TablesList: FunctionComponent<Props> = ({ tables, viewType }) => {
  return (
    <div className={style.container} data-view={viewType}>
      {tables.map((table) => {
        if (viewType === ViewType.list) {
          return <TableListItem key={table.id} {...table} />;
        }

        return <TableCard key={table.id} {...table} />;
      })}
    </div>
  );
};

export default TablesList;

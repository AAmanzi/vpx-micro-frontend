import { FunctionComponent, useState } from 'react';
import { FiPlay, FiStar } from 'react-icons/fi';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';

import { Table } from 'src/types/table';

import style from './TablesList.module.scss';
import TableCard from './components/TableCard';

interface Props {
  tables: Array<Table>;
}

const TablesList: FunctionComponent<Props> = ({ tables }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  return (
    <div className={style.container}>
      {tables.map((table) => (
        <TableCard key={table.id} {...table} />
      ))}
    </div>
  );
};

export default TablesList;

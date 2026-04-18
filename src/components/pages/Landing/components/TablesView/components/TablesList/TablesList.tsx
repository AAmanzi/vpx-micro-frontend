import { FunctionComponent, useEffect } from 'react';

import { useSelection } from 'src/providers/selection';
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
  const { isSelectionActive, selected, selectKey } = useSelection();
  const selectedTableId = selected?.type === 'table' ? selected.id : null;
  const isTableSelectActive = isSelectionActive && selected?.type === 'table';

  useEffect(() => {
    if (!selectedTableId) {
      return;
    }

    const hasSelectedTable = tables.some(
      (table) => table.id === selectedTableId,
    );

    if (!hasSelectedTable) {
      selectKey(null, false);
    }
  }, [selectedTableId, selectKey, tables]);

  return (
    <div className={style.container} data-view={viewType}>
      {tables.map((table, index) => {
        if (viewType === ViewType.list) {
          return (
            <TableListItem
              key={table.id}
              {...table}
              selectionKey={`table:${table.id}`}
              selectionOrder={index + 1}
              isSelected={isTableSelectActive && selectedTableId === table.id}
            />
          );
        }

        return (
          <TableCard
            key={table.id}
            {...table}
            selectionKey={`table:${table.id}`}
            selectionOrder={index + 1}
            isSelected={isTableSelectActive && selectedTableId === table.id}
          />
        );
      })}
    </div>
  );
};

export default TablesList;

import { FunctionComponent } from 'react';

import { GridSettings, ViewType } from 'src/types/config';
import { ResolvedTable } from 'src/types/table';

import style from './TablesList.module.scss';
import TableCard from './components/TableCard';
import TableListItem from './components/TableListItem';

interface Props {
  tables: Array<ResolvedTable>;
  viewType: ViewType;
  gridSettings: GridSettings;
  scrollToTopOnTableStart: boolean;
}

const TablesList: FunctionComponent<Props> = ({
  tables,
  viewType,
  gridSettings,
  scrollToTopOnTableStart,
}) => {
  return (
    <div
      className={style.container}
      data-view={viewType}
      data-card-size={gridSettings.cardSize}>
      {tables.map((table) => {
        if (viewType === ViewType.list) {
          return (
            <TableListItem
              key={table.id}
              {...table}
              scrollToTopOnTableStart={scrollToTopOnTableStart}
            />
          );
        }

        return (
          <TableCard
            key={table.id}
            {...table}
            gridSettings={gridSettings}
            scrollToTopOnTableStart={scrollToTopOnTableStart}
          />
        );
      })}
    </div>
  );
};

export default TablesList;

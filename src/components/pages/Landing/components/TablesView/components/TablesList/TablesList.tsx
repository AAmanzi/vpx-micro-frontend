import { FunctionComponent, useEffect, useState } from 'react';

import {
  DEFAULT_NEXT_TABLE_KEY,
  DEFAULT_PREVIOUS_TABLE_KEY,
} from 'src/consts/config';
import { ViewType } from 'src/types/config';
import { Table } from 'src/types/table';

import style from './TablesList.module.scss';
import TableCard from './components/TableCard';
import TableListItem from './components/TableListItem';

interface Props {
  tables: Array<Table>;
  viewType: ViewType;
}

const NEXT_TABLE_KEY = DEFAULT_NEXT_TABLE_KEY;
const PREVIOUS_TABLE_KEY = DEFAULT_PREVIOUS_TABLE_KEY;

const TablesList: FunctionComponent<Props> = ({ tables, viewType }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isTableSelectActive, setIsTableSelectActive] = useState(false);

  useEffect(() => {
    if (!selectedTableId) {
      return;
    }

    const hasSelectedTable = tables.some(
      (table) => table.id === selectedTableId,
    );

    if (!hasSelectedTable) {
      setSelectedTableId(null);
      setIsTableSelectActive(false);
    }
  }, [selectedTableId, tables]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== NEXT_TABLE_KEY && event.key !== PREVIOUS_TABLE_KEY) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if (isTypingTarget || tables.length === 0) {
        return;
      }

      event.preventDefault();
      setIsTableSelectActive(true);

      setSelectedTableId((currentSelectedTableId) => {
        if (!currentSelectedTableId) {
          return tables[0].id;
        }

        const currentIndex = tables.findIndex(
          (table) => table.id === currentSelectedTableId,
        );

        if (currentIndex === -1) {
          return tables[0].id;
        }

        const nextIndex =
          event.key === NEXT_TABLE_KEY
            ? Math.min(currentIndex + 1, tables.length - 1)
            : Math.max(currentIndex - 1, 0);

        return tables[nextIndex].id;
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tables]);

  useEffect(() => {
    if (!selectedTableId || !isTableSelectActive) {
      return;
    }

    const selectedElement = document.querySelector<HTMLElement>(
      `[data-table-id="${selectedTableId}"]`,
    );

    if (!selectedElement) {
      return;
    }

    selectedElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [isTableSelectActive, selectedTableId]);

  useEffect(() => {
    if (!isTableSelectActive) {
      return;
    }

    const handlePointerDown = () => {
      setIsTableSelectActive(false);
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isTableSelectActive]);

  return (
    <div className={style.container} data-view={viewType}>
      {tables.map((table) => {
        if (viewType === ViewType.list) {
          return (
            <div key={table.id} data-table-id={table.id}>
              <TableListItem
                {...table}
                isSelected={isTableSelectActive && selectedTableId === table.id}
              />
            </div>
          );
        }

        return (
          <div key={table.id} data-table-id={table.id}>
            <TableCard
              {...table}
              isSelected={isTableSelectActive && selectedTableId === table.id}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TablesList;

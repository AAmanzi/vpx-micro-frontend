import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import Tag, { Type as TagType } from 'src/components/Tag';
import { FileSystemItem } from 'src/types/file';
import { Table } from 'src/types/table';

import style from './TableEntry.module.scss';

interface Props {
  table: Table;
  unassignedRoms: Array<FileSystemItem>;
  onAssignRom: (table: Table, rom: FileSystemItem) => void;
  onRemoveTable: (table: Table) => void;
  onRemoveRom: (table: Table) => void;
  onTableNameChange: (table: Table, newName: string) => void;
}

const TableEntry: FunctionComponent<Props> = ({
  table,
  unassignedRoms,
  onAssignRom,
  onRemoveTable,
  onRemoveRom,
  onTableNameChange,
}) => {
  const [isRomSelectOpen, setIsRomSelectOpen] = useState(false);

  const handleNameChange = (value: string) => {
    onTableNameChange(table, value);
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <Input
          size={InputSize.small}
          value={table.name}
          onChange={handleNameChange}
          fontWeight='bold'
        />
        <button
          className={style.removeButton}
          onClick={() => onRemoveTable(table)}>
          <Icon className={style.removeIcon} icon='trash' />
        </button>
      </div>
      <div className={style.info}>
        <Tag icon='file-code' label={table.vpxFile} />
        {table.romFile ? (
          <div className={style.romInfo}>
            <Tag icon='package' label={table.romFile} type={TagType.success} />
            <button
              className={classNames(style.removeButton, style.small)}
              onClick={() => onRemoveRom(table)}>
              <Icon
                className={style.removeIcon}
                icon='cross'
                width={14}
                height={14}
              />
            </button>
          </div>
        ) : (
          <div>
            <button
              className={style.assignButton}
              onClick={() => setIsRomSelectOpen((open) => !open)}>
              <Icon
                className={style.assignIcon}
                icon='circle-alert'
                width={10}
                height={10}
              />
              <span className='caption-small-bold'>Assign ROM</span>
              <Icon
                className={classNames(style.chevronIcon, {
                  [style.open]: isRomSelectOpen,
                })}
                icon='chevron-down'
                width={10}
                height={10}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEntry;

import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import Tag, { Type as TagType } from 'src/components/Tag';
import { FileSystemItem } from 'src/types/file';
import { Table } from 'src/types/table';

import { TableFile } from '../../types';
import style from './TableEntry.module.scss';
import RomSelect from './components/RomSelect';

interface Props {
  table: TableFile;
  unassignedRoms: Array<FileSystemItem>;
  onAssignRom: (table: TableFile, rom: FileSystemItem) => void;
  onRemoveTable: (table: TableFile) => void;
  onRemoveRom: (table: TableFile) => void;
  onTableNameChange: (table: TableFile, newName: string) => void;
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

  const hasUnassignedRoms = unassignedRoms.length > 0;

  const handleNameChange = (value: string) => {
    onTableNameChange(table, value);
  };

  const handleRomSelect = (rom: FileSystemItem) => {
    onAssignRom(table, rom);
  };

  const handleToggleRomSelect = () => {
    if (hasUnassignedRoms) {
      setIsRomSelectOpen((prev) => !prev);
    }
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
          type='button'
          className={style.removeButton}
          onClick={() => onRemoveTable(table)}>
          <Icon className={style.removeIcon} icon='trash' />
        </button>
      </div>
      <div className={style.info}>
        <Tag icon='file-code' label={table.fileName} />
        {table.rom ? (
          <div className={style.romInfo}>
            <Tag icon='package' label={table.rom.name} type={TagType.success} />
            <button
              type='button'
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
          <div className={style.assignRom}>
            <button
              type='button'
              className={style.assignButton}
              onClick={handleToggleRomSelect}
              disabled={!hasUnassignedRoms}>
              <Icon
                className={style.assignIcon}
                icon='circle-alert'
                width={10}
                height={10}
              />
              <span className='caption-small-bold'>
                {hasUnassignedRoms ? 'Assign ROM' : 'No ROMs available'}
              </span>
              {hasUnassignedRoms && (
                <Icon
                  className={classNames(style.chevronIcon, {
                    [style.open]: isRomSelectOpen,
                  })}
                  icon='chevron-down'
                  width={10}
                  height={10}
                />
              )}
            </button>
            {isRomSelectOpen && (
              <RomSelect
                unassignedRoms={unassignedRoms}
                onSelect={handleRomSelect}
                onClose={() => setIsRomSelectOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEntry;

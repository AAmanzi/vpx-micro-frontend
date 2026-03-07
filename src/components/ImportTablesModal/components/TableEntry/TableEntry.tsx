import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';
import Input, { Size as InputSize } from 'src/components/Input';
import RomPicker from 'src/components/RomPicker';
import Tag from 'src/components/Tag';
import { FileSystemItem } from 'src/types/file';
import { TableFile } from 'src/types/file';

import style from './TableEntry.module.scss';

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
  const handleNameChange = (value: string) => {
    onTableNameChange(table, value);
  };

  const handleRomSelect = (rom: FileSystemItem) => {
    onAssignRom(table, rom);
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
        <RomPicker
          selectedRom={table.rom || null}
          options={unassignedRoms}
          expectedRomName={table.expectedRomName || null}
          onRemoveRom={() => onRemoveRom(table)}
          onSelect={handleRomSelect}
        />
      </div>
    </div>
  );
};

export default TableEntry;

import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import Input, { Size as InputSize } from 'src/components/Input';
import RomPicker from 'src/components/RomPicker';
import Tag from 'src/components/Tag';
import type { FileSystemItem, TableFile } from 'src/types/file';

import SectionHeader from '../SectionHeader';
import style from './NewTablesSection.module.scss';

interface Props {
  tables: Array<TableFile>;
  availableRoms: Array<FileSystemItem>;
  includedByPath: Record<string, boolean>;
  onToggleInclude: (filePath: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNameChange: (filePath: string, value: string) => void;
  onRomChange: (filePath: string, romPath: string) => void;
}

const NewTablesSection: FunctionComponent<Props> = ({
  tables,
  availableRoms,
  includedByPath,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
  onNameChange,
  onRomChange,
}) => {
  const handleRomSelect = (table: TableFile) => (rom: FileSystemItem) => {
    onRomChange(table.filePath, rom.path);
  };

  return (
    <div>
      <SectionHeader
        color='blue'
        title={`${Object.values(includedByPath).filter(Boolean).length} of ${tables.length} selected for import`}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
      <div className={style.list}>
        {tables.map((table) => {
          const isIncluded = includedByPath[table.filePath] ?? true;

          return (
            <div
              key={table.filePath}
              className={classNames(style.row, {
                [style.selected]: isIncluded,
              })}
              onClick={() => onToggleInclude(table.filePath)}>
              <div onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isIncluded}
                  onChange={() => onToggleInclude(table.filePath)}
                  color='blue'
                />
              </div>
              <div className={style.content}>
                <div onClick={(event) => event.stopPropagation()}>
                  <Input
                    size={InputSize.small}
                    value={table.name}
                    onChange={(value) => onNameChange(table.filePath, value)}
                    fontWeight='bold'
                  />
                </div>

                <div className={style.meta}>
                  <Tag icon='file-code' label={table.fileName} />
                  <div onClick={(event) => event.stopPropagation()}>
                    <RomPicker
                      selectedRom={table.rom || null}
                      options={availableRoms}
                      expectedRomName={table.expectedRomName || null}
                      onRemoveRom={() => onRomChange(table.filePath, '')}
                      onSelect={handleRomSelect(table)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewTablesSection;

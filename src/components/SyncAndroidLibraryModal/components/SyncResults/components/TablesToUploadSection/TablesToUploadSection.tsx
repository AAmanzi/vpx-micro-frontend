import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import Tag, { Type as TagType } from 'src/components/Tag';
import type { TableFile } from 'src/types/file';

import SectionHeader from '../SectionHeader';
import style from './TablesToUploadSection.module.scss';

interface Props {
  tables: Array<TableFile>;
  includedByPath: Record<string, boolean>;
  onToggleInclude: (filePath: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const TablesToUploadSection: FunctionComponent<Props> = ({
  tables,
  includedByPath,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div>
      <SectionHeader
        color='blue'
        title={`${Object.values(includedByPath).filter(Boolean).length} of ${tables.length} selected for upload`}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
      <div className={style.list}>
        {tables.map((table) => {
          const isIncluded = includedByPath[table.filePath] ?? true;

          return (
            <button
              key={table.filePath}
              className={classNames(style.row, {
                [style.selected]: isIncluded,
              })}
              onClick={() => onToggleInclude(table.filePath)}
              type='button'>
              <Checkbox checked={isIncluded} onChange={() => {}} color='blue' />
              <div className={style.info}>
                <span className='primary-text-color body-md-semibold'>
                  {table.name}
                </span>
                <div className={style.tags}>
                  <Tag icon='file-code' label={table.fileName} />
                  {table.rom && (
                    <Tag
                      icon='package'
                      label={table.rom.name}
                      type={TagType.success}
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TablesToUploadSection;

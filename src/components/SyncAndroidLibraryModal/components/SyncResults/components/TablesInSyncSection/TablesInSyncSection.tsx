import { FunctionComponent } from 'react';

import Tag, { Type as TagType } from 'src/components/Tag';
import type { TableFile } from 'src/types/file';

import style from './TablesInSyncSection.module.scss';

interface Props {
  tables: Array<TableFile>;
}

const TablesInSyncSection: FunctionComponent<Props> = ({ tables }) => {
  return (
    <div className={style.list}>
      {tables.map((table) => (
        <div key={table.filePath} className={style.row}>
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
        </div>
      ))}
    </div>
  );
};

export default TablesInSyncSection;

import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import Tag, { Type as TagType } from 'src/components/Tag';
import { ScanResult } from 'src/types/table';

import SectionHeader from '../SectionHeader';
import style from './MissingFilesSection.module.scss';

type MissingFileItem = ScanResult['tablesWithMissingFiles'][number];

interface Props {
  items: Array<MissingFileItem>;
  includedByTableId: Record<string, boolean>;
  onToggleInclude: (tableId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const MissingFilesSection: FunctionComponent<Props> = ({
  items,
  includedByTableId,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div>
      <SectionHeader
        color='red'
        title={`${items.filter((item) => includedByTableId[item.table.id] ?? true).length} of ${items.length} selected for cleanup`}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        warningIcon='circle-alert'
        warningText='These tables have missing files. Select to remove tables with missing VPX files or clear missing ROM and backglass associations.'
      />
      <div className={style.list}>
        {items.map((item) => {
          const isIncluded = includedByTableId[item.table.id] ?? true;
          const missingFiles = [
            ...(item.missingVpxFile ? ['VPX'] : []),
            ...(item.missingRomFile ? ['ROM'] : []),
            ...(item.missingBackglassFile ? ['Backglass'] : []),
          ];
          const tagText = `Missing ${missingFiles.join(' and ')}`;

          return (
            <button
              key={item.table.id}
              className={classNames(style.row, {
                [style.selected]: isIncluded,
              })}
              onClick={() => onToggleInclude(item.table.id)}
              type='button'>
              <Checkbox checked={isIncluded} onChange={() => {}} color='red' />
              <div className={style.info}>
                <span className='primary-text-color body-md-semibold'>
                  {item.table.name}
                </span>
                <div className={style.tags}>
                  <Tag
                    type={TagType.warning}
                    icon='file-code'
                    label={tagText}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MissingFilesSection;

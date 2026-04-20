import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import type { FileSystemItem } from 'src/types/file';

import SectionHeader from '../SectionHeader';
import style from './UnsyncedRomsToUploadSection.module.scss';

interface Props {
  roms: Array<FileSystemItem>;
  includedByPath: Record<string, boolean>;
  onToggleInclude: (romPath: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disabled?: boolean;
}

const UnsyncedRomsToUploadSection: FunctionComponent<Props> = ({
  roms,
  includedByPath,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
  disabled = false,
}) => {
  return (
    <div>
      <SectionHeader
        color='yellow'
        title={`${Object.values(includedByPath).filter(Boolean).length} of ${roms.length} selected for upload`}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        disabled={disabled}
        warningIcon='triangle-alert'
        warningText='These ROM files are missing on Android but required by the selected tables.'
      />
      <div className={style.list}>
        {roms.map((rom) => {
          const isIncluded = includedByPath[rom.path] ?? true;

          return (
            <button
              key={rom.path}
              className={classNames(style.row, {
                [style.selected]: isIncluded,
              })}
              onClick={() => onToggleInclude(rom.path)}
              type='button'
              disabled={disabled}>
              <Checkbox
                checked={isIncluded}
                onChange={() => {}}
                color='yellow'
              />
              <div className={style.info}>
                <span className='primary-text-color body-md-semibold'>
                  {rom.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnsyncedRomsToUploadSection;

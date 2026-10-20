import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import type { FileSystemItem } from 'src/types/file';

import SectionHeader from '../SectionHeader';
import style from './UnmatchedBackglassesSection.module.scss';

interface Props {
  backglasses: Array<FileSystemItem>;
  includedByPath: Record<string, boolean>;
  onToggleInclude: (backglassPath: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const UnmatchedBackglassesSection: FunctionComponent<Props> = ({
  backglasses,
  includedByPath,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
}) => (
  <div>
    <SectionHeader
      color='yellow'
      title={`${backglasses.filter((backglass) => includedByPath[backglass.path] ?? false).length} of ${backglasses.length} selected for deletion`}
      onSelectAll={onSelectAll}
      onDeselectAll={onDeselectAll}
      warningIcon='triangle-alert'
      warningText='These backglass files are not referenced by any table. Consider deleting them to free up space.'
    />
    <div className={style.list}>
      {backglasses.map((backglass) => {
        const isIncluded = includedByPath[backglass.path] ?? false;

        return (
          <button
            key={backglass.path}
            className={classNames(style.row, {
              [style.selected]: isIncluded,
            })}
            onClick={() => onToggleInclude(backglass.path)}
            type='button'>
            <Checkbox checked={isIncluded} onChange={() => {}} color='yellow' />
            <div className={style.info}>
              <span className='primary-text-color body-md-semibold'>
                {backglass.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

export default UnmatchedBackglassesSection;

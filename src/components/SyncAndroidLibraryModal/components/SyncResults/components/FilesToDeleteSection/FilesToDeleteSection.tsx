import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Checkbox from 'src/components/Checkbox';
import type { AndroidFileSystemItem } from 'src/types/android';

import SectionHeader from '../SectionHeader';
import style from './FilesToDeleteSection.module.scss';

interface Props {
  files: Array<AndroidFileSystemItem>;
  includedByPath: Record<string, boolean>;
  onToggleInclude: (filePath: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const FilesToDeleteSection: FunctionComponent<Props> = ({
  files,
  includedByPath,
  onToggleInclude,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div>
      <SectionHeader
        color='red'
        title={`${Object.values(includedByPath).filter(Boolean).length} of ${files.length} selected for deletion`}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        warningIcon='circle-alert'
        warningText='These files exist on Android but are not in your local Android library selection.'
      />
      <div className={style.list}>
        {files.map((file) => {
          const isIncluded = includedByPath[file.path] ?? false;

          return (
            <button
              key={file.path}
              className={classNames(style.row, {
                [style.selected]: isIncluded,
              })}
              onClick={() => onToggleInclude(file.path)}
              type='button'>
              <Checkbox checked={isIncluded} onChange={() => {}} color='red' />
              <div className={style.info}>
                <span className='primary-text-color body-md-semibold'>
                  {file.name}
                </span>
                <span className='secondary-text-color body-xs-regular'>
                  {file.path}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilesToDeleteSection;

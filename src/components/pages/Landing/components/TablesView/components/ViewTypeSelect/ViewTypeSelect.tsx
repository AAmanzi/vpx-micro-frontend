import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';
import { ViewType } from 'src/types/config';

import style from './ViewTypeSelect.module.scss';

interface Props {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
}

const ViewTypeSelect: FunctionComponent<Props> = ({
  viewType,
  onViewTypeChange,
}) => {
  const handleViewTypeChange = (newViewType: ViewType) => {
    onViewTypeChange(newViewType);
  };

  return (
    <div className={style.container}>
      <button
        type='button'
        className={classNames(style.button, {
          [style.active]: viewType === ViewType.grid,
        })}
        onClick={() => handleViewTypeChange(ViewType.grid)}
        title='Grid view'>
        <Icon
          icon='grid'
          className='secondary-text-color'
          width={16}
          height={16}
        />
      </button>
      <button
        type='button'
        className={classNames(style.button, {
          [style.active]: viewType === ViewType.list,
        })}
        onClick={() => handleViewTypeChange(ViewType.list)}
        title='List view'>
        <Icon
          icon='list'
          className='secondary-text-color'
          width={16}
          height={16}
        />
      </button>
    </div>
  );
};

export default ViewTypeSelect;

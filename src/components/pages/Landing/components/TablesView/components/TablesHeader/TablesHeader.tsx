import { FunctionComponent } from 'react';

import Input from 'src/components/Input';
import { Order, ViewType } from 'src/types/config';

import ViewTypeSelect from '../ViewTypeSelect';
import style from './TablesHeader.module.scss';
import OrderPicker from './components/OrderPicker';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  viewType: ViewType;
  onViewTypeChange: (newValue: ViewType) => Promise<void>;
  favoritesOnTop: boolean;
  onFavoritesOnTopChange: (newValue: boolean) => Promise<void>;
  order: Order;
  onOrderChange: (newValue: Order) => Promise<void>;
  isOrderPickerDisabled?: boolean;
}

const TablesHeader: FunctionComponent<Props> = ({
  query,
  onQueryChange,
  viewType,
  onViewTypeChange,
  favoritesOnTop,
  onFavoritesOnTopChange,
  order,
  onOrderChange,
  isOrderPickerDisabled = false,
}) => {
  return (
    <div className={style.header}>
      <div className={style.search}>
        <Input
          value={query}
          onChange={onQueryChange}
          icon='search'
          placeholder='Search tables, vpx files or roms...'
          clearable
        />
      </div>
      <div className={style.infoAndFiltering}>
        <ViewTypeSelect
          viewType={viewType}
          onViewTypeChange={onViewTypeChange}
        />
        <OrderPicker
          favoritesOnTop={favoritesOnTop}
          onFavoritesOnTopChange={onFavoritesOnTopChange}
          order={order}
          onOrderChange={onOrderChange}
          disabled={isOrderPickerDisabled}
        />
      </div>
    </div>
  );
};

export default TablesHeader;

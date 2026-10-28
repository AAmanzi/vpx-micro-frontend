import { FunctionComponent } from 'react';

import Input from 'src/components/Input';
import { GridSettings, Order, ViewType } from 'src/types/config';

import ViewTypeSelect from '../ViewTypeSelect';
import style from './TablesHeader.module.scss';
import GridSettingsPopover from './components/GridSettingsPopover/GridSettingsPopover';
import OrderPicker from './components/OrderPicker';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  viewType: ViewType;
  onViewTypeChange: (newValue: ViewType) => Promise<void>;
  gridSettings: GridSettings;
  onGridSettingsChange: (settings: Partial<GridSettings>) => Promise<void>;
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
  gridSettings,
  onGridSettingsChange,
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
        <div className={style.viewTypeControls}>
          {viewType === ViewType.grid && (
            <GridSettingsPopover
              settings={gridSettings}
              onChange={onGridSettingsChange}
            />
          )}
          <ViewTypeSelect
            viewType={viewType}
            onViewTypeChange={onViewTypeChange}
          />
        </div>
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

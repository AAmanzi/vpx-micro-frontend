import { Order } from 'src/types/config';
import { Table } from 'src/types/table';

export interface Props {
  title: string;
  description?: string;
  tables: Array<Table>;
  librarySize: number;
  defaultOrder?: Order;
  emptyStateVariant?: 'favorites' | 'recentlyPlayed';
  isOrderPickerDisabled?: boolean;
}

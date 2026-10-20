import { Order } from 'src/types/config';
import { ResolvedTable } from 'src/types/table';

export interface Props {
  title: string;
  description?: string;
  tables: Array<ResolvedTable>;
  librarySize: number;
  defaultOrder?: Order;
  emptyStateVariant?: 'favorites' | 'recentlyPlayed' | 'archive' | 'android';
  isOrderPickerDisabled?: boolean;
  isScanLibraryDisabled?: boolean;
  androidFeaturesEnabled?: boolean;
  animationKey: string;
}

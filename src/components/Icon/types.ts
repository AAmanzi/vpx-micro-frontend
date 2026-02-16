export type Icon =
  | 'plus'
  | 'grid'
  | 'star'
  | 'cog'
  | 'folder'
  | 'play'
  | 'monitor'
  | 'edit'
  | 'trash'
  | 'kebab';

export interface Props {
  icon: Icon;
  width?: number;
  height?: number;
  className?: string;
}

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
  | 'kebab'
  | 'cross'
  | 'save'
  | 'locked'
  | 'unlocked'
  | 'search'
  | 'reload';

export interface Props {
  icon: Icon;
  width?: number;
  height?: number;
  className?: string;
}

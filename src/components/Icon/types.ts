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
  | 'reload'
  | 'archive'
  | 'file-code'
  | 'package'
  | 'circle-alert'
  | 'chevron-down';

export interface Props {
  icon: Icon;
  width?: number;
  height?: number;
  className?: string;
}

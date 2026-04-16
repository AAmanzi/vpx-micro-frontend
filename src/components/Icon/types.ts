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
  | 'arrow-up-down'
  | 'archive'
  | 'file-code'
  | 'package'
  | 'circle-alert'
  | 'chevron-down'
  | 'chevron-right'
  | 'circle-checkmark'
  | 'triangle-alert'
  | 'circle-cross'
  | 'database'
  | 'scan-search'
  | 'package-cross'
  | 'folder-export'
  | 'shield-checkmark'
  | 'clock-recent'
  | 'list'
  | 'external-link';

export interface Props {
  icon: Icon;
  width?: number;
  height?: number;
  className?: string;
}

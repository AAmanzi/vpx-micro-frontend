import { VPX_DEFAULT_ROM_PATH, VPX_DEFAULT_TABLES_PATH } from 'src/consts/vpx';

export const getDefaultRomsDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_ROM_PATH}`;
};

export const getDefaultTablesDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_TABLES_PATH}`;
};

export const displayDateWithTime = (date: Date | number): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return d.toLocaleDateString(undefined, options);
};

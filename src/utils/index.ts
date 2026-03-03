import { VPX_DEFAULT_ROM_PATH, VPX_DEFAULT_TABLES_PATH } from 'src/consts/vpx';

export const getDefaultRomsDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_ROM_PATH}`;
};

export const getDefaultTablesDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_TABLES_PATH}`;
};

export const displayDate = (date: Date | number): string => {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const displayRelativeDate = (date: Date | number): string => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return '';
  }

  const diffMs = timestamp - Date.now();
  const absoluteDiffMs = Math.abs(diffMs);

  if (absoluteDiffMs < 60 * 1000) {
    return 'Just now';
  }

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'always' });
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'day', ms: 24 * 60 * 60 * 1000 },
    { unit: 'hour', ms: 60 * 60 * 1000 },
    { unit: 'minute', ms: 60 * 1000 },
  ];

  for (const { unit, ms } of units) {
    if (absoluteDiffMs >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'Just now';
};

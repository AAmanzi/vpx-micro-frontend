import {
  VPX_DEFAULT_EXECUTABLE,
  VPX_DEFAULT_ROM_PATH,
  VPX_DEFAULT_TABLES_PATH,
} from 'src/consts/vpx';
import { Table } from 'src/types/table';

export const normalizePathForComparison = (value?: string): string =>
  (value || '').trim().toLowerCase().replace(/\\/g, '/');

export const getDefaultRomsDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_ROM_PATH}`;
};

export const getDefaultTablesDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_TABLES_PATH}`;
};

export const getDefaultVpxExecutablePath = (vpxRootPath: string): string => {
  return `${vpxRootPath}/${VPX_DEFAULT_EXECUTABLE}`;
};

export const displayDate = (date: Date | number): string => {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const displayRelativeDate = (
  date: Date | number | null | undefined,
): string => {
  if (date === undefined || date === null) {
    return 'Never';
  }

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

export const getDeterministicVariant = (
  value: string,
  variantsCount: number,
): number => {
  if (!value || variantsCount <= 0) {
    return 0;
  }

  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash % variantsCount;
};

export const getTableGradientVariant = (table: Table): string => {
  const variant = getDeterministicVariant(
    table?.romFile || table.vpxFile || table.id,
    8,
  );
  return `tableGradient${variant}`;
};

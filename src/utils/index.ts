import path from 'path';

import {
  VPX_DEFAULT_EXECUTABLE,
  VPX_DEFAULT_ROM_PATH,
  VPX_DEFAULT_TABLES_PATH,
} from 'src/consts/vpx';
import { FileSystemItem } from 'src/types/file';
import { ResolvedTable } from 'src/types/table';

export const normalizePathForComparison = (value?: string): string =>
  (value || '').trim().toLowerCase().replace(/\\/g, '/');

export const mergeRoms = (
  ...romLists: Array<Array<FileSystemItem>>
): Array<FileSystemItem> => {
  const seenPaths = new Set<string>();

  return romLists.flat().filter((rom) => {
    const normalizedPath = normalizePathForComparison(rom.path);

    if (seenPaths.has(normalizedPath)) {
      return false;
    }

    seenPaths.add(normalizedPath);

    return true;
  });
};

export const getAssignedRoms = (
  tables: Array<ResolvedTable>,
): Array<FileSystemItem> =>
  mergeRoms(
    tables.flatMap((table) =>
      table.romFile && table.romFilePath
        ? [{ name: table.romFile, path: table.romFilePath }]
        : [],
    ),
  );

const RESTRICTED_VPX_ROOT_PATH_PATTERNS = [
  /^[a-z]:\/program files(?: \(x86\))?(?:\/|$)/,
  /^[a-z]:\/windows(?:\/|$)/,
  /^\/applications(?:\/|$)/,
  /^\/system(?:\/|$)/,
  /^\/library(?:\/|$)/,
];

export const getVpxRootPathPermissionWarning = (
  inputPath?: string,
): string | null => {
  const normalizedPath = normalizePathForComparison(inputPath);

  if (!normalizedPath) {
    return null;
  }

  const isRestrictedPath = RESTRICTED_VPX_ROOT_PATH_PATTERNS.some((pattern) =>
    pattern.test(normalizedPath),
  );

  if (!isRestrictedPath) {
    return null;
  }

  return 'This folder is commonly write-protected and may require administrator access for imports, updates, or file management. Prefer a user-writable location such as C:/Visual Pinball.';
};

export const normalizePath = (inputPath: string): string => {
  return path.normalize((inputPath || '').trim().replace(/\\/g, '/'));
};

export const getDefaultRomsDirectory = (vpxRootPath: string): string => {
  const result = path.join(vpxRootPath, VPX_DEFAULT_ROM_PATH);
  return normalizePath(result);
};

export const getDefaultTablesDirectory = (vpxRootPath: string): string => {
  const result = path.join(vpxRootPath, VPX_DEFAULT_TABLES_PATH);
  return normalizePath(result);
};

export const getDefaultVpxExecutablePath = (vpxRootPath: string): string => {
  const result = path.join(vpxRootPath, VPX_DEFAULT_EXECUTABLE);
  return normalizePath(result);
};

export const displayDate = (date: Date | number): string => {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const displayDateTime = (date: Date | number): string =>
  new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

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

export const getTableGradientVariant = (table: ResolvedTable): string => {
  const variant = getDeterministicVariant(
    table?.romFile || table.vpxFile || table.id,
    8,
  );
  return `tableGradient${variant}`;
};

export const getTableGradientVariable = (table: ResolvedTable): string => {
  const variant = getDeterministicVariant(
    table?.romFile || table.vpxFile || table.id,
    8,
  );

  return `var(--table-gradient-color-${variant})`;
};

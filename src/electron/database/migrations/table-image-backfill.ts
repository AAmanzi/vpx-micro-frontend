import { lookupTableImageUrl } from '../../utils/tableImages';
import * as tablesDb from '../tables';
import type { Migration } from './types';

const LEGACY_IMAGE_BACKFILL_TARGET_VERSION = '1.1.0';

const parseSemverCore = (value: string): [number, number, number] | null => {
  const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const isVersionLower = (value: string, target: string): boolean => {
  const parsedValue = parseSemverCore(value);
  const parsedTarget = parseSemverCore(target);

  if (!parsedValue || !parsedTarget) {
    return false;
  }

  for (let index = 0; index < parsedTarget.length; index += 1) {
    if (parsedValue[index] < parsedTarget[index]) {
      return true;
    }

    if (parsedValue[index] > parsedTarget[index]) {
      return false;
    }
  }

  return false;
};

const backfillMissingTableImages = async (): Promise<void> => {
  const tables = tablesDb.getAllResolved();

  for (const table of tables) {
    if (table.imgUrl || table.imagePreference === 'none') {
      continue;
    }

    const imgUrl = await lookupTableImageUrl({
      tableName: table.name,
      vpxFileName: table.vpxFile,
      romFileName: table.romFile,
    });

    if (!imgUrl) {
      continue;
    }

    tablesDb.update(table.id, { imgUrl });
  }
};

const migration: Migration = {
  id: 'pre-1.1.0-table-image-backfill',
  shouldRun: ({ lastBootVersion }) => {
    if (!lastBootVersion) {
      return tablesDb.getAll().length > 0;
    }

    return isVersionLower(
      lastBootVersion,
      LEGACY_IMAGE_BACKFILL_TARGET_VERSION,
    );
  },
  run: backfillMissingTableImages,
  failurePolicy: 'continue',
};

export default migration;

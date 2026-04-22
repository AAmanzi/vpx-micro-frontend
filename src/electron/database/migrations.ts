import Store from 'electron-store';

import * as tablesDb from './tables';
import { lookupTableImageUrl } from '../utils/tableImages';

type MigrationState = {
  completed: Record<string, boolean>;
  lastBootVersion?: string;
};

type MigrationStoreSchema = {
  state: MigrationState;
};

const IMAGE_BACKFILL_MIGRATION_ID = 'pre-1.1.0-table-image-backfill';
const LEGACY_IMAGE_BACKFILL_TARGET_VERSION = '1.1.0';

const store = new Store<MigrationStoreSchema>({
  name: 'app-migrations',
  defaults: {
    state: {
      completed: {},
    },
  },
});

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

const shouldRunLegacyImageBackfill = (lastBootVersion?: string): boolean => {
  if (!lastBootVersion) {
    return tablesDb.getAll().length > 0;
  }

  return isVersionLower(lastBootVersion, LEGACY_IMAGE_BACKFILL_TARGET_VERSION);
};

const backfillMissingTableImages = async (): Promise<number> => {
  const tables = tablesDb.getAll();
  let updatedCount = 0;

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

    const updatedTable = tablesDb.update(table.id, { imgUrl });

    if (updatedTable) {
      updatedCount += 1;
    }
  }

  return updatedCount;
};

export async function runAppMigrations(currentVersion: string): Promise<void> {
  const state = store.get('state');
  const completed = state?.completed || {};

  try {
    const alreadyCompleted = completed[IMAGE_BACKFILL_MIGRATION_ID];

    if (!alreadyCompleted && shouldRunLegacyImageBackfill(state.lastBootVersion)) {
      const updatedCount = await backfillMissingTableImages();
      completed[IMAGE_BACKFILL_MIGRATION_ID] = true;

      console.log(
        `Migration ${IMAGE_BACKFILL_MIGRATION_ID} completed, updated ${updatedCount} table image(s).`,
      );
    }
  } catch (error) {
    console.error(`Failed migration ${IMAGE_BACKFILL_MIGRATION_ID}:`, error);
  } finally {
    store.set('state', {
      completed,
      lastBootVersion: currentVersion,
    });
  }
}

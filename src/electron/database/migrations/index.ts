import Store from 'electron-store';

import librarySchemaV1 from './library-schema-v1';
import tableImageBackfill from './table-image-backfill';
import type { Migration, MigrationState } from './types';

type MigrationStoreSchema = {
  state: MigrationState;
};

const migrations: Migration[] = [librarySchemaV1, tableImageBackfill];

const store = new Store<MigrationStoreSchema>({
  name: 'app-migrations',
  defaults: {
    state: {
      completed: {},
    },
  },
});

export async function runAppMigrations(currentVersion: string): Promise<void> {
  const state = store.get('state');
  const completed = { ...state.completed };
  let migrationFailed = false;

  for (const migration of migrations) {
    if (completed[migration.id]) {
      continue;
    }

    if (
      migration.shouldRun &&
      !migration.shouldRun({ lastBootVersion: state.lastBootVersion })
    ) {
      completed[migration.id] = true;
      continue;
    }

    try {
      await migration.run();
      completed[migration.id] = true;
      console.log(`Migration ${migration.id} completed.`);
    } catch (error) {
      migrationFailed = true;
      console.error(`Failed migration ${migration.id}:`, error);

      if (migration.failurePolicy !== 'continue') {
        store.set('state', {
          completed,
          lastBootVersion: state.lastBootVersion,
        });
        throw error;
      }
    }
  }

  store.set('state', {
    completed,
    lastBootVersion: migrationFailed ? state.lastBootVersion : currentVersion,
  });
}

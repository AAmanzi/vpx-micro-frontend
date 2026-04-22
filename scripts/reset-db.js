const { app } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { name: packageName } = require('../package.json');

async function resetDb() {
  await app.whenReady();

  const storeDirectory = path.join(app.getPath('appData'), packageName);

  const configStore = new Store({
    name: 'app-config',
    cwd: storeDirectory,
    defaults: {},
  });

  const tablesStore = new Store({
    name: 'app-tables',
    cwd: storeDirectory,
    defaults: {},
  });

  const migrationsStore = new Store({
    name: 'app-migrations',
    cwd: storeDirectory,
    defaults: {},
  });

  const filesToReset = [
    configStore.path,
    tablesStore.path,
    migrationsStore.path,
  ];

  configStore.clear();
  tablesStore.clear();
  migrationsStore.clear();

  console.log('Database reset complete.');
  console.log(`Store directory: ${storeDirectory}`);
  console.log('Cleared stores:');
  filesToReset.forEach((filePath) => console.log(`- ${filePath}`));

  app.quit();
}

resetDb().catch((error) => {
  console.error('Failed to reset database:', error);
  app.exit(1);
});

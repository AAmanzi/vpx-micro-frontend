import fs from 'fs';
import path from 'path';

export const backupLibraryMigration = (libraryPath: string): string => {
  const directory = path.dirname(libraryPath);
  const backupsPath = path.join(directory, 'backups');
  fs.mkdirSync(backupsPath, { recursive: true });
  const backupPath = fs.mkdtempSync(
    path.join(backupsPath, 'before-library-schema-v1-'),
  );

  for (const source of [
    libraryPath,
    path.join(directory, 'app-config.json'),
    path.join(directory, 'app-migrations.json'),
  ]) {
    const original = fs.readFileSync(source);
    const destination = path.join(backupPath, path.basename(source));
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);

    if (!original.equals(fs.readFileSync(destination))) {
      throw new Error(`Migration backup verification failed: ${destination}`);
    }
  }

  console.log(`Library migration backup saved to ${backupPath}`);
  return backupPath;
};

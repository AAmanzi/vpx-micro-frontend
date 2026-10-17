import { app } from 'electron';
import path from 'path';

if (!app.isPackaged) {
  app.setPath(
    'userData',
    path.join(app.getPath('appData'), `${app.getName()}-dev`),
  );
}

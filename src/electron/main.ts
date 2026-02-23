import { spawn } from 'child_process';
import { BrowserWindow, app, ipcMain } from 'electron';
import fs from 'fs';
import http from 'http';
import path from 'path';

import * as api from './api';
import * as db from './db';

type FileSystemItem = {
  path: string;
  name: string;
  children?: Array<FileSystemItem>;
};

const NEXT_PORT = process.env.NEXT_PORT || 3000;
let nextProcess: any = null;

function startNext() {
  const cwd = path.join(__dirname, '..', '..');
  const useYarn = fs.existsSync(path.join(cwd, 'yarn.lock'));
  const pkgManager = useYarn ? 'yarn' : 'npm';
  let args;
  if (process.env.NODE_ENV === 'production') {
    args = useYarn ? ['start:next'] : ['run', 'start:next'];
  } else {
    args = useYarn ? ['dev:next'] : ['run', 'dev:next'];
  }

  nextProcess = spawn(pkgManager, args, { cwd, shell: true, stdio: 'inherit' });
  nextProcess.on('close', (code: number, signal: any) => {
    console.log(`Next process exited with ${code || signal}`);
  });
}

function waitForServer(port: number, timeout = 30000, interval = 300) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    (function check() {
      const req = http.get(
        { hostname: '127.0.0.1', port, path: '/', timeout: 2000 },
        (res) => {
          res.resume();
          resolve();
        },
      );
      req.on('error', () => {
        if (Date.now() - start > timeout)
          return reject(new Error('Timeout waiting for Next.js'));
        setTimeout(check, interval);
      });
    })();
  });
}

const listDirectoryItems = async (
  directoryPath: string,
  acceptedExtensions: Set<string>,
): Promise<Array<FileSystemItem>> => {
  let entries: Array<fs.Dirent> = [];

  try {
    entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    return [];
  }

  const items: Array<FileSystemItem> = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const children = await listDirectoryItems(entryPath, acceptedExtensions);

      if (children.length > 0) {
        items.push({
          path: entryPath,
          name: entry.name,
          children,
        });
      }

      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!acceptedExtensions.has(extension)) {
      continue;
    }

    items.push({
      path: entryPath,
      name: entry.name,
    });
  }

  return items;
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const url = `http://localhost:${NEXT_PORT}`;
  win.loadURL(url);
};

app.whenReady().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    startNext();
    try {
      await waitForServer(Number(NEXT_PORT), 30000, 300);
    } catch (err) {
      console.error('Next did not start in time:', err);
    }
  }

  // Optionally seed mock data when DEV_MOCK=1
  if (process.env.DEV_MOCK) {
    try {
      // dynamic import so mock is only loaded in dev when requested
      const mock = await import('./mock')
      const items = mock.Tables || mock.default || []
      const count = db.seed(items)
      console.log(`Seeded ${count} mock tables`)
    } catch (e) {
      console.error('Failed to seed mock data', e)
    }
  }

  // register IPC handlers that call the api layer (named with 'table(s)')
  ipcMain.handle('api:getAllTables', async () => api.getAllTables());
  ipcMain.handle('api:getTableById', async (_, id: string) => api.getTableById(id));
  ipcMain.handle('api:createTable', async (_, item) => api.createTable(item));
  ipcMain.handle('api:updateTable', async (_, id: string, item) =>
    api.updateTable(id, item),
  );
  ipcMain.handle('api:deleteTable', async (_, id: string) => api.deleteTable(id));
  ipcMain.handle('api:setTableFavorite', async (_, id: string, fav: boolean) =>
    api.setTableFavorite(id, fav),
  );
  ipcMain.handle('api:ping', async () => api.ping());
  ipcMain.handle(
    'api:getDirectoryTree',
    async (_, directoryPath: string, acceptedExtensions: string[]) => {
      if (!directoryPath || !Array.isArray(acceptedExtensions)) {
        return [];
      }

      const extensionSet = new Set(
        acceptedExtensions
          .map((extension) => extension.toLowerCase())
          .filter(Boolean),
      );

      if (extensionSet.size === 0) {
        return [];
      }

      return listDirectoryItems(directoryPath, extensionSet);
    },
  );

  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function shutdownNext() {
  if (nextProcess && !nextProcess.killed) {
    try {
      nextProcess.kill();
    } catch (e) {}
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    shutdownNext();
    app.quit();
  }
});

app.on('before-quit', () => shutdownNext());

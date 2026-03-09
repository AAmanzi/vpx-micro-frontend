import { spawn } from 'child_process';
import { BrowserWindow, app, ipcMain } from 'electron';
import fs from 'fs';
import http from 'http';
import path from 'path';

import type { Config } from 'src/types/config';
import type { TableFile } from 'src/types/file';
import type { ScanResult } from 'src/types/table';

import * as api from './api';
import * as db from './database/tables';

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

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
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
      const mock = await import('./database/mock');
      const items = mock.Tables || mock.default || [];
      const count = db.seed(items);
      console.log(`Seeded ${count} mock tables`);
    } catch (e) {
      console.error('Failed to seed mock data', e);
    }
  }

  // register IPC handlers that call the api layer
  ipcMain.handle('api:getAllTables', async () => api.getAllTables());
  ipcMain.handle('api:deleteTable', async (_, id: string) =>
    api.deleteTable(id),
  );
  ipcMain.handle('api:setTableFavorite', async (_, id: string, fav: boolean) =>
    api.setTableFavorite(id, fav),
  );
  ipcMain.handle('api:renameTable', async (_, id: string, newName: string) =>
    api.renameTable(id, newName),
  );
  ipcMain.handle('api:getUnmatchedRoms', async () => api.getUnmatchedRoms());
  ipcMain.handle(
    'api:updateTableRom',
    async (_, tableId: string, rom: TableFile['rom'] | null) =>
      api.updateTableRom(tableId, rom || null),
  );
  ipcMain.handle(
    'api:updateTableVpxExecutablePath',
    async (_, tableId: string, executablePath: string | null) =>
      api.updateTableVpxExecutablePath(tableId, executablePath),
  );
  ipcMain.handle(
    'api:importTables',
    async (_, tables: Array<TableFile>, deleteAfterImport: boolean) =>
      api.importTables(tables, deleteAfterImport),
  );
  ipcMain.handle('api:getExpectedRomName', async (_, vpxFilePath: string) =>
    api.getExpectedRomName(vpxFilePath),
  );
  ipcMain.handle('api:openDirectoryPicker', async () =>
    api.openDirectoryPicker(),
  );
  ipcMain.handle(
    'api:openFilePicker',
    async (_, acceptedExtensions: string[], acceptFolders: boolean = true) =>
      api.openFilePicker(acceptedExtensions, acceptFolders),
  );
  ipcMain.handle('api:openPath', async (_, path: string) => api.openPath(path));
  ipcMain.handle(
    'api:getDirectoryTree',
    async (_, directoryPath: string, acceptedExtensions: string[]) =>
      api.getDirectoryTree(directoryPath, acceptedExtensions),
  );
  ipcMain.handle('api:getConfig', async () => api.getConfig());
  ipcMain.handle('api:updateVpxRootPath', async (_, path: string) =>
    api.updateVpxRootPath(path),
  );
  ipcMain.handle('api:updateRomsDirectoryPath', async (_, path: string) =>
    api.updateRomsDirectoryPath(path),
  );
  ipcMain.handle('api:updateTablesDirectoryPath', async (_, path: string) =>
    api.updateTablesDirectoryPath(path),
  );
  ipcMain.handle(
    'api:updateDeleteFilesAfterImport',
    async (_, deleteAfterImport: boolean) =>
      api.updateDeleteFilesAfterImport(deleteAfterImport),
  );
  ipcMain.handle(
    'api:updateKeepFavoritesOnTop',
    async (_, keepFavoritesOnTop: boolean) =>
      api.updateKeepFavoritesOnTop(keepFavoritesOnTop),
  );
  ipcMain.handle('api:updateOrder', async (_, order: Config['order']) =>
    api.updateOrder(order),
  );
  ipcMain.handle('api:startTable', async (_, tableId: string) =>
    api.startTable(tableId),
  );
  ipcMain.handle('api:clearTables', async () => api.clearTables());
  ipcMain.handle('api:scanVpxLibrary', async () => api.scanVpxLibrary());
  ipcMain.handle('api:applyScanResult', async (_, scanResult: ScanResult) =>
    api.applyScanResult(scanResult),
  );
  ipcMain.handle('api:exportTables', async (_, destinationPath: string) =>
    api.exportTables(destinationPath),
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

"use strict";

// src/electron/preload.ts
var import_electron = require("electron");
var invoke = (channel, ...args) => import_electron.ipcRenderer.invoke(channel, ...args);
var frontendApi = {
  getAllTables: () => invoke("api:getAllTables"),
  setTableFavorite: (id, fav) => invoke("api:setTableFavorite", id, fav).then(() => void 0),
  deleteTable: (id) => invoke("api:deleteTable", id).then(() => void 0),
  renameTable: (id, newName) => invoke("api:renameTable", id, newName).then(() => void 0),
  getExpectedRomName: (vpxFilePath) => invoke("api:getExpectedRomName", vpxFilePath),
  getPathForFile: (file) => import_electron.webUtils.getPathForFile(file),
  getDirectoryTree: (directoryPath, acceptedExtensions) => invoke(
    "api:getDirectoryTree",
    directoryPath,
    acceptedExtensions
  ),
  importTables: (tables) => invoke("api:importTables", tables).then(() => void 0),
  getConfig: () => invoke("api:getConfig"),
  updateVpxRootPath: (path) => invoke("api:updateVpxRootPath", path).then(() => void 0),
  updateRomsDirectoryPath: (path) => invoke("api:updateRomsDirectoryPath", path).then(() => void 0),
  updateTablesDirectoryPath: (path) => invoke("api:updateTablesDirectoryPath", path).then(() => void 0),
  startTable: (tableId) => invoke("api:startTable", tableId).then(() => void 0)
};
import_electron.contextBridge.exposeInMainWorld("api", frontendApi);

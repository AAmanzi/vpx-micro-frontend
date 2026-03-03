"use strict";

// src/electron/preload.ts
var import_electron = require("electron");
var invoke = (channel, ...args) => import_electron.ipcRenderer.invoke(channel, ...args);
var frontendApi = {
  getAllTables: () => invoke("api:getAllTables"),
  setTableFavorite: (id, fav) => invoke("api:setTableFavorite", id, fav),
  deleteTable: (id) => invoke("api:deleteTable", id),
  renameTable: (id, newName) => invoke("api:renameTable", id, newName),
  getExpectedRomName: (vpxFilePath) => invoke("api:getExpectedRomName", vpxFilePath),
  getPathForFile: (file) => {
    try {
      return {
        success: true,
        data: import_electron.webUtils.getPathForFile(file)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "FILE_PATH_ERROR",
          message: error instanceof Error ? error.message : "Failed to resolve file path"
        }
      };
    }
  },
  getDirectoryTree: (directoryPath, acceptedExtensions) => invoke(
    "api:getDirectoryTree",
    directoryPath,
    acceptedExtensions
  ),
  importTables: (tables, deleteAfterImport) => invoke("api:importTables", tables, deleteAfterImport),
  getConfig: () => invoke("api:getConfig"),
  updateVpxRootPath: (path) => invoke("api:updateVpxRootPath", path),
  updateRomsDirectoryPath: (path) => invoke("api:updateRomsDirectoryPath", path),
  updateTablesDirectoryPath: (path) => invoke("api:updateTablesDirectoryPath", path),
  updateDeleteFilesAfterImport: (deleteAfterImport) => invoke(
    "api:updateDeleteFilesAfterImport",
    deleteAfterImport
  ),
  startTable: (tableId) => invoke("api:startTable", tableId)
};
import_electron.contextBridge.exposeInMainWorld("api", frontendApi);

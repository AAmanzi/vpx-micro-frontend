"use strict";

// src/electron/preload.ts
var import_electron = require("electron");
var invoke = (channel, ...args) => import_electron.ipcRenderer.invoke(channel, ...args);
import_electron.contextBridge.exposeInMainWorld("api", {
  getAllTables: () => invoke("api:getAllTables"),
  getTableById: (id) => invoke("api:getTableById", id),
  createTable: (item) => invoke("api:createTable", item),
  updateTable: (id, item) => invoke("api:updateTable", id, item),
  deleteTable: (id) => invoke("api:deleteTable", id),
  setTableFavorite: (id, fav) => invoke("api:setTableFavorite", id, fav),
  ping: () => invoke("api:ping"),
  getPathForFile: (file) => import_electron.webUtils.getPathForFile(file)
});

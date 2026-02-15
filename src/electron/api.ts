import type { Table } from 'src/types/table'
import * as db from './db'

// Endpoint surface for tables with explicit names including 'table(s)'.

export function getAllTables(): Table[] {
  return db.getAll()
}

export function getTableById(id: string): Table | null {
  return db.getById(id)
}

export function createTable(item: Table): Table | null {
  return db.create(item)
}

export function updateTable(id: string, item: Partial<Table>): Table | null {
  return db.update(id, item)
}

export function deleteTable(id: string): boolean {
  return db.remove(id)
}

export function setTableFavorite(id: string, fav: boolean): Table | null {
  return db.setFavorite(id, fav)
}

export function ping(): { ok: true } {
  return { ok: true }
}

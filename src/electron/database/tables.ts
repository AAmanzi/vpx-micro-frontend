import Store from 'electron-store';

import type { Table } from 'src/types/table';

type StoreSchema = {
  tables: Record<string, Table>;
};

const store = new Store<StoreSchema>({
  name: 'app-tables',
  defaults: { tables: {} },
});

export function getAll(): Table[] {
  const tables = store.get('tables') || {};
  return Object.values(tables).sort((a, b) => a.name.localeCompare(b.name));
}

export function create(item: Table): Table {
  const tables = store.get('tables') || {};
  tables[item.id] = item;
  store.set('tables', tables);
  return item;
}

export function update(id: string, item: Partial<Table>): Table | null {
  const tables = store.get('tables') || {};
  const existing = tables[id];
  if (!existing) return null;
  const merged = { ...existing, ...item };
  tables[id] = merged;
  store.set('tables', tables);
  return merged;
}

export function remove(id: string): boolean {
  const tables = store.get('tables') || {};
  if (!tables[id]) return false;
  delete tables[id];
  store.set('tables', tables);
  return true;
}

export function setFavorite(id: string, fav: boolean): Table | null {
  const tables = store.get('tables') || {};
  const existing = tables[id];
  if (!existing) return null;
  existing.isFavorite = fav;
  tables[id] = existing;
  store.set('tables', tables);
  return existing;
}

export function setForAndroid(id: string, isForAndroid: boolean): Table | null {
  const tables = store.get('tables') || {};
  const existing = tables[id];
  if (!existing) return null;
  existing.isForAndroid = isForAndroid;
  tables[id] = existing;
  store.set('tables', tables);
  return existing;
}

export function setArchived(id: string, archived: boolean): Table | null {
  const tables = store.get('tables') || {};
  const existing = tables[id];
  if (!existing) return null;
  existing.isArchived = archived;
  tables[id] = existing;
  store.set('tables', tables);
  return existing;
}

export function get(id: string): Table | null {
  const tables = store.get('tables') || {};
  return tables[id] || null;
}

export function seed(items: Table[]) {
  const map: Record<string, Table> = {};
  items.forEach((it) => {
    map[it.id] = it;
  });
  store.set('tables', map);
  return Object.keys(map).length;
}

export function clear(): void {
  store.set('tables', {});
}

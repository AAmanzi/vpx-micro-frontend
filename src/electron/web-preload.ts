import TablesSource from 'src/electron/mock';
import type { Table } from 'src/types/table';

const clone = <T>(v: T) => JSON.parse(JSON.stringify(v)) as T;

const tables: Table[] = clone(TablesSource);

const makeId = () => `table-${Math.random().toString(36).slice(2, 9)}`;

const api = {
  getAllTables: (): Promise<Table[]> => Promise.resolve(clone(tables)),
  getTableById: (id: string): Promise<Table | null> => {
    const t = tables.find((x) => x.id === id) || null;
    return Promise.resolve(clone(t));
  },
  createTable: (item: Table): Promise<Table> => {
    const next: Table = { ...item, id: item.id || makeId() };
    tables.push(next);
    return Promise.resolve(clone(next));
  },
  updateTable: (id: string, item: Partial<Table>): Promise<Table | null> => {
    const idx = tables.findIndex((t) => t.id === id);
    if (idx === -1) return Promise.resolve(null);
    tables[idx] = { ...tables[idx], ...item };
    return Promise.resolve(clone(tables[idx]));
  },
  deleteTable: (id: string): Promise<boolean> => {
    const idx = tables.findIndex((t) => t.id === id);
    if (idx === -1) return Promise.resolve(false);
    tables.splice(idx, 1);
    return Promise.resolve(true);
  },
  setTableFavorite: (id: string, fav: boolean): Promise<Table | null> => {
    const idx = tables.findIndex((t) => t.id === id);
    if (idx === -1) return Promise.resolve(null);
    tables[idx].isFavorite = fav;
    return Promise.resolve(clone(tables[idx]));
  },
  ping: (): Promise<{ ok: true }> => Promise.resolve({ ok: true }),
};

if (typeof window !== 'undefined') {
  // only set when not already provided by Electron preload
  if (!(window as any).api) {
    (window as any).api = api;
  }
}

export default api;

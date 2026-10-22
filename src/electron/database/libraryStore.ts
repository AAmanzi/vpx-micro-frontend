import Store from 'electron-store';

import type { LibraryStore } from 'src/types/table';

export const libraryStore = new Store<LibraryStore>({
  name: 'app-tables',
  defaults: { tables: {}, files: {} },
});

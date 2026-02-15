import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function DbDemo() {
  const [items, setItems] = useState<any[]>([]);

  const api = typeof window !== 'undefined' ? (window as any).api : null;

  useEffect(() => {
    if (!api) return;
    api.getAllTables().then((rows: any[]) => setItems(rows));
  }, []);

  const add = async () => {
    if (!api) return;
    const id = uuidv4();
    const created = await api.createTable({
      id,
      name: `Pinball ${Math.floor(Math.random() * 1000)}`,
      vpxFile: '',
      romFile: '',
      isFavorite: false,
    });
    setItems((s) => [...s, created]);
  };

  const toggleFav = async (id: string, fav: boolean) => {
    if (!api) return;
    const updated = await api.setTableFavorite(id, !fav);
    setItems((s) => s.map((it) => (it.id === id ? updated : it)));
  };

  const remove = async (id: string) => {
    if (!api) return;
    await api.deleteTable(id);
    setItems((s) => s.filter((it) => it.id !== id));
  };

  return (
    <section>
      <h2>DB Demo</h2>
      <button onClick={add}>Add random</button>
      <ul>
        {items.map((it) => (
          <li key={it.id} style={{ marginTop: 8 }}>
            <strong>{it.name}</strong> {it.isFavorite ? '★' : '☆'}
            <button
              onClick={() => toggleFav(it.id, it.isFavorite)}
              style={{ marginLeft: 8 }}>
              toggle fav
            </button>
            <button onClick={() => remove(it.id)} style={{ marginLeft: 8 }}>
              remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

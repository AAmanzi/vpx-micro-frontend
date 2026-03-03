import {
  FunctionComponent,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from 'src/consts';
import { Table } from 'src/types/table';

interface TablesContextType {
  tables: Array<Table>;
  fetchTables: () => void;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export const useTablesContext = () => {
  const context = useContext(TablesContext);

  if (!context) {
    throw new Error('useTables must be used within a TablesProvider');
  }

  return context;
};

export const TablesProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [tables, setTables] = useState<Array<Table>>([]);

  const fetchTables = () => {
    api.getAllTables().then(({ data }) => {
      if (data) {
        setTables(data);
      }
    });
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <TablesContext.Provider
      value={{
        tables,
        fetchTables,
      }}>
      {children}
    </TablesContext.Provider>
  );
};

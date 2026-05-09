import {
  FunctionComponent,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from 'src/consts';
import { Config, Platform } from 'src/types/config';

interface ConfigContextType {
  config: Config | null;
  platform: Platform | null;
  fetchConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfigContext = () => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
};

export const ConfigProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);

  const fetchConfig = () => {
    api.getConfig().then(({ data }) => {
      if (data) {
        setConfig(data);
      }
    });
  };

  useEffect(() => {
    api.getPlatform().then(({ data }) => {
      if (data) {
        setPlatform(data);
      }
    });
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        config,
        platform,
        fetchConfig,
      }}>
      {children}
    </ConfigContext.Provider>
  );
};

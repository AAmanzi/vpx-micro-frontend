import type { AppProps } from 'next/app';

import { ConfigProvider } from 'src/providers/config';
import { TablesProvider } from 'src/providers/tables';
import 'src/styles/cssVariables.css';
import 'src/styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider>
      <TablesProvider>
        <Component {...pageProps} />
      </TablesProvider>
    </ConfigProvider>
  );
}

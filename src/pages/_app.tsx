import type { AppProps } from 'next/app';

import ToastHandler from 'src/components/ToastHandler';
import { ConfigProvider } from 'src/providers/config';
import { TablesProvider } from 'src/providers/tables';
import ToastProvider from 'src/providers/toast';
import 'src/styles/cssVariables.css';
import 'src/styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider>
      <TablesProvider>
        <ToastProvider>
          <>
            <ToastHandler />
            <Component {...pageProps} />
          </>
        </ToastProvider>
      </TablesProvider>
    </ConfigProvider>
  );
}

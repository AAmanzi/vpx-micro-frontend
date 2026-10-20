import type { AppProps } from 'next/app';

import ToastHandler from 'src/components/ToastHandler';
import UpdateNotice from 'src/components/UpdateNotice/UpdateNotice';
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
            <UpdateNotice />
            <Component {...pageProps} />
          </>
        </ToastProvider>
      </TablesProvider>
    </ConfigProvider>
  );
}

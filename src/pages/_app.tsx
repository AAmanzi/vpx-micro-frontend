import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import 'src/styles/cssVariables.css';
import 'src/styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(window as any).api) {
      void import('src/electron/web-preload');
    }
  }, []);

  return <Component {...pageProps} />;
}

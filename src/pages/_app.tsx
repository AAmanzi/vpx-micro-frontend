import type { AppProps } from 'next/app';

import 'src/styles/cssVariables.css';
import 'src/styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

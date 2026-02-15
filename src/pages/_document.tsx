import Document, { Head, Html, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';

class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html className='default-mode'>
        <Head />
        <body>
          <Main />
          <div id='modal' />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

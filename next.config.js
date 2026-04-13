/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : './',
  sassOptions: {
    prependData: `@use 'src/styles/text' as *;`,
  },
  devIndicators: false,
};

module.exports = nextConfig;

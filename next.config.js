/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  assetPrefix: './',
  sassOptions: {
    prependData: `@use 'src/styles/text' as *;`,
  },
  devIndicators: false,
};

module.exports = nextConfig;

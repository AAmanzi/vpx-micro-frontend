/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@use 'src/styles/text' as *;`,
  },
  devIndicators: false,
};

module.exports = nextConfig;

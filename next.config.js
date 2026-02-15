/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@use 'src/styles/text' as *;`,
  },
};

module.exports = nextConfig;

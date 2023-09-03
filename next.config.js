/** @type {import('next').NextConfig} */

const withMDX = require( '@next/mdx' )( {
  options: {
    providerImportSource: "@mdx-js/react",
  },
} );

const nextConfig = withMDX( {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
    mdxRs: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} );


module.exports = nextConfig;

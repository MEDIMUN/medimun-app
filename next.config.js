/** @type {import('next').NextConfig} */

const withMDX = require( '@next/mdx' )( {
  options: {
    providerImportSource: "@mdx-js/react",
  },
} );

const nextConfig = withMDX( {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.medimun.org',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.medimun.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
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

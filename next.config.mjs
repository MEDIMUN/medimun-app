/** @type {import('next').NextConfig} */
const nextConfig = {
   generateBuildId: async () => {
      return process.env.GIT_HASH || Math.random().toString( 36 ).slice( 2 );
   },
   typescript: { ignoreBuildErrors: true },
   experimental: {
      serverComponentsExternalPackages: [ "undici" ],
      turbo: {
         resolveExtensions: [
            '.mdx',
            '.tsx',
            '.ts',
            '.jsx',
            '.js',
            '.mjs',
            '.json',
         ],
      }
   },
/* 	transpilePackages: [ 'next-mdx-remote-client' ],
 */	reactStrictMode: true,

};

export default nextConfig;
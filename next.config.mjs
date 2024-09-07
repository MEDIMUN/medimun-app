import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
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

const withMDX = createMDX( {} );

export default withMDX( nextConfig );

import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		reactCompiler: true,
		serverComponentsExternalPackages: [ "argon2" ],
	},
	transpilePackages: [ 'next-mdx-remote' ],
	reactStrictMode: true,

};

const withMDX = createMDX( {
	// Add markdown plugins here, as desired
} );

export default withMDX( nextConfig );

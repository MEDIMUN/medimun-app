/** @type {import('next').NextConfig} */
const nextConfig = {
	/* 	cacheHandler: process.env.NODE_ENV === "production" ? require.resolve("./cache-handler.js") : undefined,
	cacheMaxMemorySize: 0, */
	generateBuildId: async () => {
		return process.env.GIT_HASH || Math.random().toString(36).slice(2);
	},
	async redirects() {
		return [
			{
				source: "/privacy",
				destination: "/policies/privacy",
				permanent: true,
			},
			{
				source: "/conduct",
				destination: "/policies/conduct",
				permanent: true,
			},
			{
				source: "/terms",
				destination: "/policies/terms",
				permanent: true,
			},
			{
				source: "/policies",
				destination: "/policies/privacy",
				permanent: false,
			},
		];
	},
	typescript: { ignoreBuildErrors: true },
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	transpilePackages: ["next-auth"],
	experimental: {
		turbo: { optimizeImages: true },
		optimizePackageImports: ["@heroicons/react/16/solid", "@heroicons/react/16/outline", "@react-email", "@alexandernanberg/react-pdf-renderer"],
		after: true,
		serverActions: {
			bodySizeLimit: "50mb",
			allowedOrigins: ["https://www.medimun.org", "www.medimun.org", "www.medimun.org.", "https://www.medimun.org."],
		},
		reactCompiler: true,
	},
	webpack: {
		fallback: {
			fs: false,
		},
	},
	reactStrictMode: true,
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);

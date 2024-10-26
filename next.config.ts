/** @type {import('next').NextConfig} */
const nextConfig = {
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

	experimental: {
		serverActions: {
			allowedOrigins: ["https://www.medimun.org", "www.medimun.org", "www.medimun.org.", "https://www.medimun.org."],
		},
		reactCompiler: true,
	},
	reactStrictMode: true,
};

export default nextConfig;

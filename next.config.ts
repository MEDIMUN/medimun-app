import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	/* 	cacheHandler: require.resolve("./cache-handler.mjs"),
	 */ generateBuildId: async () => {
		return process.env.GIT_HASH || Math.random().toString(36).slice(2);
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "assets.aceternity.com", port: "" },
			{ protocol: "https", hostname: "images.unsplash.com", port: "" },
			{ protocol: "https", hostname: "drive.google.com", port: "" },
			{ protocol: "https", hostname: "res.cloudinary.com", port: "" },
		],
	},
	async redirects() {
		return [
			{ source: "/privacy", destination: "/policies/privacy", permanent: true },
			{ source: "/conduct", destination: "/policies/conduct", permanent: true },
			{ source: "/terms", destination: "/policies/terms", permanent: true },
			{ source: "/policies", destination: "/policies/privacy", permanent: false },
		];
	},
	typescript: { ignoreBuildErrors: true },
	compiler: { removeConsole: process.env.NODE_ENV === "production" },
	webpack: (config) => {
		config.resolve.alias.canvas = false;
		return config;
	},
	transpilePackages: ["next-auth", "prettier"],
	experimental: {
		dynamicIO: true,
		ppr: true,
		reactCompiler: true,
		staleTimes: { dynamic: 30, static: 3600 },
		turbo: { resolveAlias: { canvas: "./empty-module.ts" } },
		optimizePackageImports: ["@react-email", "@react-pdf/renderer", "lucide-react", "@headlessui/react"],
		serverActions: { bodySizeLimit: "50mb", allowedOrigins: ["https://www.medimun.org", "www.medimun.org", "www.medimun.org.", "https://www.medimun.org."] },
	},
	reactStrictMode: true,
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: false });

export default withBundleAnalyzer(nextConfig);

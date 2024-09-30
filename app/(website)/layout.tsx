import "@/styles/globals.css";

import { WebsiteNavbar } from "@/app/(website)/navbar";

import { NextAuthProvider } from "./providers";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import prisma from "@/prisma/client";
import { Footer } from "@/app/(website)/main-footer";
import NextTopLoader from "nextjs-toploader";

export const metadata = {
	title: {
		template: "%s • MEDIMUN",
		default: "MEDIMUN",
	},
};

export default async function RootLayout({ children }) {
	const selectedSession = await prisma.session.findFirst({ where: { isMainShown: true } });
	return (
		<StrictMode>
			<html lang="en" className="bg-content1 !scrollbar-hide">
				<head>
					<script defer src="https://cloud.umami.is/script.js" data-website-id="5a019229-4342-4469-95e7-15fce101a3da"></script>
				</head>
				<body id="remove-scrollbar" className="m-0 bg-transparent p-0">
					<NextAuthProvider>
						<NextTopLoader
							color="#AE2D28"
							showSpinner={false}
							initialPosition={0.08}
							crawlSpeed={200}
							height={2}
							crawl={true}
							easing="ease"
							speed={200}
						/>
						<WebsiteNavbar selectedSession={selectedSession} />
						<main className="min-h-screen">
							<div
								className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
								aria-hidden="true">
								<div
									className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-primary opacity-30"
									style={{
										clipPath:
											"polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
									}}
								/>
							</div>
							{children}
						</main>
						<Footer />
						<Toaster />
					</NextAuthProvider>
				</body>
			</html>
		</StrictMode>
	);
}

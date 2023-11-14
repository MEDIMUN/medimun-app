import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";
import Landscape from "@/components/website/Landscape";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/styles/globals.css";
import "tailwindcss/tailwind.css";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "@/components/website/CommandMenu";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
	title: {
		template: "%s • MEDIMUN",
		default: "Mediterranean Model United Nations",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
			<NextAuthProvider>
				<body className="m-0 p-0">
					<Landscape />
					<Navbar />
					<CommandMenu className="z-[500]" />
					<main className="min-h-[100svh] w-full overflow-y-hidden">{children}</main>
					<Toaster />
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}

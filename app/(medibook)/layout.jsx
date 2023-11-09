import "@/styles/globals.css";
import "tailwindcss/tailwind.css";
import Landscape from "@/components/website/Landscape";
import Navbar from "@/components/medibook/Navbar";
import { ClientProvider } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import AuthRedirect from "@/components/website/AuthRedirect";
import Footer from "@/components/medibook/Footer";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }) {
	return (
		<html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
			<ClientProvider>
				<AuthRedirect unauthenticated="/login" />
				<body>
					<Landscape />
					<Navbar />
					<main className="min-h-[calc(100svh)] overflow-y-hidden">{children}</main>
					<Footer />
					<Toaster />
				</body>
			</ClientProvider>
		</html>
	);
}

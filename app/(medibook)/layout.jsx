import "@/styles/globals.css";
import "tailwindcss/tailwind.css";
import Landscape from "@/components/website/Landscape";
import Navbar from "@/components/medibook/Navbar";
import { ClientProvider } from "./providers";
import { CommandMenu } from "@/components/medibook/CommandMenu";
import { Toaster } from "@/components/ui/toaster";
import AuthRedirect from "@/components/website/AuthRedirect";
import Footer from "@/components/website/Footer";
export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<ClientProvider>
				<AuthRedirect unauthenticated="/login" />
				<body>
					<CommandMenu />
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

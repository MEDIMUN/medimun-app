import "@/styles/globals.css";
import Landscape from "../(Website)/components/Landscape";
import Navbar from "./Navbar";
import { GeistProvider } from "./providers";
import { CommandMenu } from "./CommandMenu";
import { Toaster } from "@/components/ui/toaster";
import AuthRedirect from "../(Website)/components/AuthRedirect";
import Footer from "./Footer";
export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<GeistProvider>
				<AuthRedirect unauthenticated="/login" />
				<body>
					<CommandMenu />
					<Landscape />
					<Navbar />
					<main className="min-h-[calc(100svh)]">{children}</main>
					<Footer />
					<Toaster />
				</body>
			</GeistProvider>
		</html>
	);
}

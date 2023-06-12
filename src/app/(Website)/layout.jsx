import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Landscape from "./components/Landscape";
import "@/src/app/globals.css";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "./components/CommandMenu";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<NextAuthProvider>
				<body className="m-0 p-0">
					<Landscape />
					<Navbar />
					<CommandMenu className="z-[500]" />
					<main className="min-h-[100svh] min-w-[100vw] max-w-[100vw] overflow-y-hidden ">{children}</main>
					<Toaster />
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}

import "@/styles/globals.css";

import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";
import Landscape from "@/components/website/Landscape";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "@/components/website/CommandMenu";
import { Toaster } from "@/components/ui/toaster";
import { NextUIProvider } from "./next-ui-provider";

export const metadata = {
	title: {
		template: "%s • MEDIMUN",
		default: "MEDIMUN",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<NextAuthProvider>
				<body id="remove-scrollbar" className="m-0 bg-transparent p-0">
					<NextUIProvider>
						<Landscape />
						<Navbar />
						<CommandMenu className="z-[500]" />
						<main className="min-h-[100svh] w-full overflow-y-hidden bg-gray-100">{children}</main>
						<Toaster />
						<Footer />
					</NextUIProvider>
				</body>
			</NextAuthProvider>
		</html>
	);
}

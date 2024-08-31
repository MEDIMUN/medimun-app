import "@/styles/globals.css";

import Footer from "./Footer";
import { WebsiteNavbar } from "@/components/website/Navbar";
import Landscape from "@/components/website/Landscape";

import { NextAuthProvider } from "./providers";
import { Toaster } from "sonner";
import { StrictMode } from "react";

export const metadata = {
	title: {
		template: "%s • MEDIMUN",
		default: "MEDIMUN",
	},
};

export default function RootLayout({ children }) {
	return (
		<StrictMode>
			<html lang="en" className="bg-content1 !scrollbar-hide">
				<body id="remove-scrollbar" className="m-0 bg-transparent p-0">
					<NextAuthProvider>
						<Landscape />
						<WebsiteNavbar />
						{children}
						<Footer />
						<Toaster />
					</NextAuthProvider>
				</body>
			</html>
		</StrictMode>
	);
}

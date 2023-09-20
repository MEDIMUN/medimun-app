import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";
import Landscape from "@/components/website/Landscape";
import "@/styles/globals.css";
import "tailwindcss/tailwind.css";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "@/components/website/CommandMenu";
import { Toaster } from "@/components/ui/toaster";

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
				<body className="m-0 p-0">
					<Landscape />
					<Navbar />
					<CommandMenu className="z-[500]" />
					<main className="min-h-[100svh] w-full overflow-y-hidden">
						{children}
						{/* 						<div className="fixed bottom-0 left-0 z-[400] h-6 w-full border-t-[1px] border-t-medired bg-black px-4 text-center font-bold text-medired">
							This site is under construction
						</div> */}
					</main>
					<Toaster />
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}

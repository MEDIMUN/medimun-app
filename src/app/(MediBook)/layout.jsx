import "@/src/app/globals.css";
import Landscape from "./Landscape";
import Navbar from "./Navbar";
import { GeistProvider } from "./providers";
import { CommandMenu } from "./CommandMenu";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<GeistProvider>
				<body>
					<CommandMenu />
					<Landscape />
					<Navbar />
					{children}
					<Toaster />
				</body>
			</GeistProvider>
		</html>
	);
}

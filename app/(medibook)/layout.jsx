import "@/styles/globals.css";
import "tailwindcss/tailwind.css";
import Landscape from "@/components/website/Landscape";
import Navbar from "@/nextuipro/navigation-header-with-heading-cta";
import { ClientProvider } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import AuthRedirect from "@/components/website/AuthRedirect";
import Footer from "@/components/medibook/Footer";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NextUIProvider } from "./next-ui-provider";
import Sidebar from "@/components/medibook/Sidebar";
import DarkModeProvider from "./dark-mode-provider";

export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }) {
	return (
		<DarkModeProvider>
			<ClientProvider>
				<AuthRedirect unauthenticated="/login" />
				<body>
					<NextUIProvider>
						<Landscape />
						<div className="flex min-w-full flex-row ">
							<Sidebar />
							<div className="h-[calc(100svh)] w-full overflow-y-scroll">
								<Navbar />
								{children}
							</div>
						</div>
						<Toaster />
					</NextUIProvider>
				</body>
			</ClientProvider>
		</DarkModeProvider>
	);
}
